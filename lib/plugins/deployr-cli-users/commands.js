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

var cliUsers = require('./index'),
    common   = require('flatiron').common,
    async    = common.async;

/**
 * The CLI Commands related to managing users.
 *
 * @mixin
 * @alias plugins/deployr-cli-users/commands
 */
 var users = exports;

/** 
 * Usage for the _di users *_ commands which allow you to work with existing 
 * user accounts on DeployR. Supported commands:
 * 
 * - di users login
 * - di users logout
 * - di users whoami
 */
users.usage = [
  '`<app> users *` commands allow you to work with existing user accounts',
  '',
  '<app> users login',
  '<app> users logout',
  '<app> users whoami',
  '',
  'You will be prompted for additional user information',
  'as required.'
];

/**
 * Attempts to login the user with the prompted credentials. Makes three
 * prompt attempts and then exists. 
 *
 * @param {Function} vcallback - Continuation to pass control to when complete.
 */
users.login = function() {
    var app      = cliUsers.app,
        args     = common.args(arguments),
        callback = args.callback,
        cookie   = '',
        username = '';

    if (cliUsers.before.setup) {
        cliUsers.before.setup({
            username: app.config.get('username')
        });
    }

    //
    // Login workflow including async hooks
    //
    async.series([
            //
            // Before login hook
            //
            function before(next) {
                if (cliUsers.before.login) {
                    cliUsers.before.login({
                        username: app.config.get('username')
                    }, next);
                } else {
                    next();
                }
            },

            //
            // Login
            //
            tryAuth,

            //
            // After login hook
            //
            function after(next) {
                if (cliUsers.after.login) {
                    cliUsers.after.login({
                        cookie: cookie,
                        username: username
                    }, next);
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

    //
    // Helper function to attempt to authenticate as the current user.
    //
    function tryAuth(next) {
        function auth() {          
            app.auth(function(err, res) { 
                if (err) { return callback(err); }

                cookie = res.get('httpcookie'); 
                username = res.get('username');                

                app.config.save(function(err) {
                    return err ? next(err) : next();
                });                
            });
        }

        return app.setup ? app.setup(function () { auth(next); }) : auth(next);
    }
};

/** 
 * Usage for _di login_ command.
 *
 * - di users login
 * - di login 
 */ 
users.login.usage = [
    'Allows the user to login DeployR',
    '',    
    '<app> login'
];

/**
 * Attempts to logout current user by removing the name from application config
 * and calling _/r/user/logout_ on DeployR.
 *
 * @param {Function} vcallback - Continuation to pass control to when complete.
 */
users.logout = function(callback) {
    var app = cliUsers.app,
        username = app.config.get('username');

    async.series([
            //
            // Before hook
            //
            function before(next) {
                if (cliUsers.before.logout) {
                    cliUsers.before.logout({
                        username: username
                    }, next);
                } else {
                    next();
                }
            },
            function logout(next) {
                app.unauth(function() {
                    app.config.clear('username');
                    app.config.clear('password');
                    next();
                });
            },
            //
            // After hook
            //
            function after(next) {
                if (cliUsers.after.logout) {
                    cliUsers.after.logout({
                        username: username
                    }, next);
                } else {
                    next();
                }
            }
        ],
        //
        // End workflow
        //
        function(err, details) {
            app.config.save(function(err) {
                if (err) {
                    return callback(err, true);
                }

                app.log.info('User has been logged out');
                callback();
            });
        });
};

/** 
 * Usage for _di logout_ command.
 *
 * - di users logout
 * - di logout
 */ 
users.logout.usage = [
    'Logs out the current user from DeployR',
    '',
    '<app> logout'
];

/**
 * Retrieves the name of the current logged in user to DeployR.
 *
 * @param {Function} callback - Continuation to pass control to when complete.
 */
users.whoami = function(callback) {
    var app = cliUsers.app,
        username = app.config.get('username') || 'not logged in';

    app.log.info('You are: ' + username.magenta);
    callback();
};
/** 
 * Usage for _di whoami_ command.
 *
 * - di users whoami
 * - di whoami
 */ 
users.whoami.usage = [
    'Displays the current logged in user',
    '',
    '<app> whoami'
];