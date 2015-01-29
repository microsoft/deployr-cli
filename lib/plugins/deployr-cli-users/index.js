/*!
 * Copyright (C) 2010-2015 by Revolution Analytics Inc.
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
 * Top-level include for the `deployr-cli-users` module.
 *
 * @mixin
 * @alias plugins/deployr-cli-users
 */
var cliUsers = exports;

/**
 * Expose the plugin `commands`.
 */
cliUsers.commands = require('./commands');

/**
 * Expose the plugin name _cli-users_.
 * @property {String} name - The plugin name.
 */
cliUsers.name = 'cli-users';

/**
 * Attaches the `deployr-cli-users` behavior to the application.
 * @param {Object} options - The options object literal to use when attaching.
 */
cliUsers.attach = function(options) {
    var app = this;
    options = options || {};

    if (!app.plugins.cli) {
        throw new Error('`inquirer` plugin is required to use `deployr-cli-users`');
    } else if (!app.config) {
        throw new Error('`app.config` must be set to use `deployr-cli-users`');
    }

    /**
     * Setup state from the application attached to. 
     * @property {Object} app - The application.
     */
    cliUsers.app = app;
    cliUsers.after = options.after || {};
    cliUsers.before = options.before || {};
    common.templateUsage(app, cliUsers.commands);

    //
    // Add the necessary `<app> users *` commands
    //
    app.commands['users'] = app.commands['users'] || {};
    app.commands['users'] = common.mixin(app.commands['users'], cliUsers.commands);

    //
    // Setup aliases for `<app> users *` commands.
    //
    app.alias('login', {
        resource: 'users',
        command: 'login'
    });
    app.alias('logout', {
        resource: 'users',
        command: 'logout'
    });
    app.alias('whoami', {
        resource: 'users',
        command: 'whoami'
    });

    /**
     * Attempts to authenicate the user in DeployR.
     *
     * @memberof plugins/deployr-cli-users
     * @protected
     * @param {Function} callback - Continuation to pass control to when 
     * complete.     
     */
    app.auth = function(callback) {
        var response, error, username, attempts = 0;

        // assert there is a DeployR endpoint
        if (!app.config.get('endpoint')) {
            app.commands.endpoint(function(n) {
                app.auth(callback);
            });
            return;
        }

        app.prompt.inquirer([{
            name: 'username',
            type: 'input',
            message: 'Username:',
            default: app.config.get('username') || null,
            validate: function(input) {
                username = input;
                return input.length >= 3 || ' Please enter a valid username';
            }
        }, {
            name: 'password',
            type: 'password',
            message: 'Password:',
            validate: function(input) {
                var done = this.async();

                if (!input) {
                    done('Permission denied, please try again.');
                    return;
                }

                deployr.configure({ host: app.config.get('endpoint') })
                    .io('/r/user/login')
                    .data({ username: username, password: input })
                    .error(function(err) {
                        error = err;

                        // 
                        // 940 Authentication Error: username/password 
                        //      credentials provided are invalid.
                        //
                        if (err.get('errorCode') === 940) {
                            //
                            // Attempt to get the password three times.
                            //
                            attempts += 1;

                            if (attempts >= 3) {
                                error = 'Three failed login attempts.';
                            } else {
                                done('Permission denied, please try again.');
                                return;
                            }
                        }

                        done(true);
                    })
                    .end(function(res) {
                        response = res;
                        error = null;
                        done(true);
                    });
            }
        }], function() {
            callback(error, response);
        }.bind(this));
    };

    /**
     * Attempts to unauthenticate the user from DeployR.
     *
     * @memberof plugins/deployr-cli-users
     * @protected     
     * @param {Function} callback - Continuation to pass control to when 
     * complete.     
     */
    app.unauth = function(callback) {
        var endpoint = app.config.get('endpoint');

        if (endpoint) {
            deployr.configure({
                    host: endpoint,
                    cookies: ['JSESSIONID=' + app.config.get('cookie')],
                    sticky: true
                })
                .io('/r/user/logout')
                .end()
                .ensure(function() { callback(); });
        } else {
            callback();
        }
    };
};

/**
 * Detaches this plugin from the application.
 */
cliUsers.detach = function() {
    var app = this;

    Object.keys(app.commands['users']).forEach(function(method) {
        if (cliUsers.commands[method]) {
            delete app.commands['config'][method];
        }

        cliUsers.commands.app = null;
    });
};