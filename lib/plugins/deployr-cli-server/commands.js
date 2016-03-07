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

var cliServer = require('./index'),
    common    = require('flatiron').common,
    async     = common.async;

/**
 * The CLI Commands related to managing the DeployR server.
 *
 * @mixin
 * @alias plugins/deployr-cli-server/commands
 */
var server = exports;

/** 
 * Usage for the _di server *_ commands which allow you to work with the DeployR
 * server. Supported commands:
 * 
 * - di server endpoint
 * - di server about
 */
server.usage = [
    '`<app> server *` commands allow you to work with the DeployR server',
    '',
    '<app> server endpoint',
    '<app> server about',
    '',
    'You will be prompted for additional user information',
    'as required.'
];

/**
 * Attempts to set the DeployR server _endpoint_ location in the CLI.
 * @param {Function} callback - Continuation to pass control to when complete.
 */
server.endpoint = function() {
    var app      = cliServer.app,
        callback = common.args(arguments).callback,
        server   = {};

    if (cliServer.before.setup) {
        cliServer.before.setup({
            endpoint: app.config.get('endpoint')
        });
    }

    //
    // Endpoint workflow including async hooks
    //
    async.series([
            //
            // Before endpoint hook
            //
            function before(next) {
                if (cliServer.before.endpoint) {
                    cliServer.before.endpoint({
                        endpoint: app.config.get('endpoint')
                    }, next);
                } else {
                    next();
                }
            },

            //
            // Set the endpoint
            //
            function set(next) {
                app.setEndpoint(function(res) { // success
                    server = res; // server's meta-data
                    app.config.save(function(err) {
                        return err ? next(err) : next();
                    });
                });
            },

            //
            // After endpoint hook
            //
            function after(next) {
                if (cliServer.after.endpoint) {
                    cliServer.after.endpoint(server, next);
                } else {
                    next();
                }
            }
        ],

        //
        // Workflow end
        //
        function(err, result) {
            return err ? callback(err) : callback();
        });
};

/** 
 * Usage for _di endpoint_ command.
 *
 * - di server endpoint
 * - di endpoint
 */
server.endpoint.usage = [
    'Allows the user to set the DeployR server endpoint',
    '',
    '<app> endpoint'
];

/**
 * Displays information regarding the DeployR server at the set _endpoint_ 
 * location.
 *
 * @param {Function} callback - Continuation to pass control to when complete.
 */
server.about = function() {
    var app      = cliServer.app,
        callback = common.args(arguments).callback,
        server   = {};
    //
    // Endpoint workflow including async hooks
    //
    async.series([
            //
            // Find information 'about' the DeployR server
            //
            function about(next) {
                app.about(function(res, err) { // success
                    if (err) { callback(err); }

                    server = res; // server's meta-data
                    app.config.save(function(err) {
                        return err ? next(err) : next();
                    });
                });
            },

            //
            // After about hook
            //
            function after(next) {
                if (cliServer.after.about) {
                    cliServer.after.about(server, next);
                } else {
                    next();
                }
            }
        ],

        //
        // Workflow end
        //
        function(err, result) {
            return err ? callback(err) : callback();
        });
};

/** 
 * Usage for _di about_ command.
 *
 * - di server about
 * - di about
 */
server.about.usage = [ 
    'Displays DeployR server information based on the set server `endpoint`',
    '',
    '<app> about'
];