/*!
 * Copyright (C) 2010-2016, Microsoft Corporation
 *
 * This program is licensed to you under the terms of Version 2.0 of the
 * Apache License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * Apache License 2.0 (http://www.apache.org/licenses/LICENSE-2.0) for more 
 * details.
 */

'use strict';

var deployr = require('deployr'),
    common  = require('flatiron').common;

/**
 * Top-level include for the `deployr-cli-server` module.
 *
 * @mixin
 * @alias plugins/deployr-cli-server
 */    
var cliServer = exports;

/**
 * Expose the plugin `commands`.
 */
cliServer.commands = require('./commands');

/**
 * Expose the plugin name _cli-server_.
 * @property {String} name - The plugin name.
 */
cliServer.name = 'cli-server';

/**
 * Attaches the `deployr-cli-server` behavior to the application.
 * @param {Object} options - The options object literal to use when attaching.
 */
cliServer.attach = function(options) {
    var app = this;
    options = options || {};

    if (!app.plugins.cli) {
        throw new Error('`cli` plugin is required to use `deployr-cli-server`');
    } else if (!app.config) {
        throw new Error('`app.config` must be set to use `deployr-cli-server`');
    }

    /**
     * Setup state from the application attached to. 
     * @property {Object} app - The application.
     */    
    cliServer.app = app;
    cliServer.after = options.after || {};
    cliServer.before = options.before || {};
    common.templateUsage(app, cliServer.commands);

    //
    // Add the necessary `<app> server *` commands
    //
    app.commands['server'] = app.commands['server'] || {};
    app.commands['server'] = common.mixin(app.commands['server'], cliServer.commands);

    //
    // Setup aliases for `<app> server *` commands.
    //
    app.alias('about', { // $ di about
        resource: 'server',
        command: 'about'
    });

    app.alias('endpoint', { // $ di endpoint
        resource: 'server',
        command: 'endpoint'
    });

    app.home = this.home;

    /**
     * Attempts to retrieve information about the DeployR server at the
     * supplied endpoint.
     *
     * @protected
     * @param {Function} callback - Continuation to pass control to when 
     * complete.     
     */
    app.about = function(callback) {
        var endpoint = app.config.get('endpoint') || null;

        if (endpoint) {            
            deployr.configure({ host: endpoint })
              .io('/r/server/info')
              .error(function(err) { callback(null, err); })
              .end(function(res) {                
                callback({ endpoint: endpoint, info: res.get('info') });
              });              
        } else {
            callback({});
        }
    };    

    /**
     * Attempts to set the DeployR server endpoint.
     *
     * @memberof plugins/deployr-cli-server    
     * @protected
     * @param {Function} callback - Continuation to pass control to when 
     * complete.     
     */    
    app.setEndpoint = function(callback) {
        var server   = {},
            regx     = new RegExp('^(http|https)://', 'i'),
            endpoint = app.config.get('endpoint') || null,
            errorMsg = ' Please enter a valid DeployR endpoint.',
            hostMsg  = (!endpoint ? ' http(s)://dhost:port' : '');

        app.prompt.inquirer([{
            name: 'endpoint',
            type: 'input',
            default: endpoint,
            message: 'DeployR Server' + app.chalk.dim.yellow(hostMsg) + ':',
            validate: function(input) {
                var done = this.async();
                if (input.length > 0) {
                	// Be more forgiving on the entered DeployR 'endpoint':
                    //   - http(s)://dhost:port
                    //   - http(s)://dhost:port/deployr
                    //   - dhost:port
                    //   - dhost:port/deployr
                    input = input.replace(/\/*$|\/*deployr\/*$/, '');
                    input = regx.test(input) ? input : 'http://' + input;

                    deployr.configure({ host: input })
                        .io('/r/server/info')
                        .error(function(err) {
                            deployr.configure({ host: '' });
                            done(errorMsg);
                        })
                        .end(function(res) {
                        	server = { endpoint: input, info: res.get('info') };
                            done(true);
                        });
                } else {
                    done(errorMsg);
                }
            }
        }], function() {
            callback(server);
        });    
    };
};

/**
 * Detaches this plugin from the application.
 */
cliServer.detach = function() {
    var app = this;

    Object.keys(app.commands['server']).forEach(function(method) {
        if (cliServer.commands[method]) {
            delete app.commands['config'][method];
        }

        cliServer.commands.app = null;
    });
};
