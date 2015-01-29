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

/**
 * The DeployR command line interface, a tool for running useful DeployR 
 * utilities.
 * @module deployr-cli
 */

var path     = require('path'),
    opn      = require('opn'),
    flatiron = require('flatiron');

/** 
 * @alias module:deployr-cli 
 */ 
var di = module.exports = flatiron.app;

/**
 * Expose the CLI name _di_.
 * @property {String} name - The CLI name.
 */
di.name = 'di';

//
// Setup `di` to use `pkginfo` to expose version,
//
require('pkginfo')(module, 'name', 'version');

//
// Configure `di` to use `flatiron.plugins.cli`
//
di.use(flatiron.plugins.cli, {
    version: true,
    usage: require('./lib/usage'),
    source: path.join(__dirname, 'lib', 'commands'),
    argv: {
        version: {
            alias: 'v',
            description: 'prints DeployR version and exit',
            string: true
        },
        diconf: {
            alias: 'j',
            description: 'specify file to load configuration from',
            string: true
        },
        help: {
            alias: 'h',
            description: 'prints cli help and exit',
            string: true
        }
    }
});

//
// Configure `di` to use `cli-inquirer` for more sophisticated prompts.
//
di.use(require('./lib/plugins/inquirer'));

//
// Setup `di` with: config, command aliases settings
//
di.chalk = require('chalk');
di._ = require('lodash');
di.brand = require('./lib/util/brand');
di.spawnCommand = require('./lib/util/spawn-command');
require('./lib/config');
require('./lib/alias');
require('./lib/commands');

//
// Setup other di settings.
//
di.started = false;
di.displayExit = true;
di.noop = function() {};

/**
 * Starts the di CLI and runs the specified command.
 *
 * @param {Function} callback - Continuation to pass control to when complete.
 */
di.start = function(callback) {
    //
    // whoami command should not output anything but username
    //
    if (di.argv._[0] === 'whoami') {
        di.displayExit = false;
        console.log(di.config.get('username') || '');
        return;
    }

    di.init(function(err) {

        if (err) {
            di.showError(di.argv._.join(' '), err);
            return callback(err);
        }

        // intercept `--help, -h` help options
        di.argv._ = di.argv.help ? ['help'] : di.argv._;

        // `di` with no command or options routes to `home`
        if (!di.argv._[0]) {
            di.home();
        } else {
            return di.exec(di.argv._, callback);
        }
    });
};

/**
 * Runs the specified command in the `di` CLI.
 *
 * @param {String} command - Command to execute
 * @param {Function} callback - Continuation to pass control to when complete. 
 */
di.exec = function(command, callback) {
    function execCommand(err) {

        if (err) {
            return callback(err);
        }

        di.displayExit = false;
        di.router.dispatch('on', command.join(' '), di.log, function(err, shallow) {

            if (err) {
                di.showError(command.join(' '), err, shallow);
                return callback(err);
            }

            callback();
        });
    }

    return !di.started ? di.setup(execCommand) : execCommand();
};

/**
 * Sets up the instances of the Resource clients for di.
 * there is no io here, yet this function is ASYNC.
 *
 * @param {Function} callback - continuation to pass control to when complete.
 */
di.setup = function(callback) {
    if (di.started === true) {
        return callback();
    }

    di.started = true;

    // Hack - override the 'jitsu' refrence in `$di help config list`
    di.commands.config.list.usage = [
        'Lists all configuration values currently',
        'set in the .diconf file',
        '',
        'di config list'
    ];

    callback();
};

/**
 * Displays the `err` to the user for the `command` supplied.
 *
 * @param {String} command  - Command which has errored.
 * @param {Error} err       - Error received for the command.
 * @param {Boolean} shallow - Indicate if a deep stack should be displayed
 */
di.showError = function(command, err, shallow) {    
    di.log.error('Error running command ' + di.chalk.magenta(command));

    if (err.stack && !shallow) {
        err.stack.split('\n').forEach(function(trace) {
            di.log.error(trace);
        });
    } else if (err.deployr) {
        di.log.error('DeployR API error on call "' + err.get('call') + '"');        
        di.log.error('Error Code: ' + err.get('errorCode'));
        di.log.error('Error: ' + err.get('error'));
    } else {
        di.log.error(err);
    }
};

/**
 * Menu selection to run commands.
 */
di.goto = function(command, callback) {
    var cmdStr = (command || []).join(' ');

    di.plugins.cli.executeCommand(command, function(err, shallow) {
        if (err) {
            di.showError(cmdStr, err, shallow);
        }

        di.displayExit = false;
    });
};

/**
 * Display the home `di` screen with the intial set of options.
 */
di.home = function() {
    var separator = di.prompt.separator,
        endpoint  = di.config.get('endpoint'),
        name      = di.config.get('username'),
        defaults  = [{
            name: 'Install an example',
            value: {
                method: 'goto',
                args: ['install', 'example']
            }
        }, {
            name: 'Settings',
            value: {
                method: 'settings'
            }                   
        }, {
            name: 'Find some help',
            value: {
                method: 'findHelp'
            }
        }, {
            name: 'Get me out of here!',
            value: {
                method: 'noop'
            }
        }];

    name = (name && endpoint ? ' ' + name + '@' + endpoint.replace(/^https?:\/\//, '') : '');

    di.prompt.inquirer([{
        name: 'whatNext',
        type: 'list',
        message: 'Welcome to DeployR CLI' + di.chalk.magenta(name) + '!',
        choices: this._.flatten([
            separator('Choices'),
            separator(),
            defaults,
            separator()
        ])
    }], function(answer) {
        this[answer.whatNext.method](answer.whatNext.args);
    }.bind(this));
};

/**
 * Prompts user with a few helpful resources, then opens it in their browser.
 */
di.findHelp = function() {
    di.prompt.inquirer([{
        name: 'whereTo',
        type: 'list',
        message: 'Here are a few helpful resources.\n' +
            '\nI will open the link you select in your browser for you',
        choices: [{
            name: 'Take me to the documentation',
            value: di.config.get('homepage')
        }, {
            name: 'File an issue on GitHub',
            value: di.config.get('git').cli
        }, {            
            name: 'Take me back home!',
            value: {
                method: 'home'
            }
        }]
    }], function(answer) {
        if (this._.isFunction(this[answer.whereTo.method])) {
            this[answer.whereTo.method](answer.whereTo.args);
        } else {
            opn(answer.whereTo);
        }
    }.bind(this));
};

/**
 * Prompts user with setting options.
 */
di.settings = function() {
    var separator = di.prompt.separator,
        choices = [{
            name: 'DeployR endpoint',
            value: {
                method: 'goto',
                args: ['endpoint']
            }
        }, {
            name: 'About server',
            value: {
                method: 'goto',
                args: ['about']
            }
        }, {
            name: 'Take me back home!',
            value: {
                method: 'home'
            }
        }];

    di.prompt.inquirer([{
        name: 'general',
        type: 'list',
        message: 'General settings',
        choices: this._.flatten([
            separator('Choices'),
            separator(),
            choices,
            separator()
        ])
    }], function(answer) {
        this[answer.general.method](answer.general.args, function() {
            di.home();
        });
    }.bind(di));
};

/**
 * Ends the `di` process with the a common exit message.
 */
di.exit = function() {
    if (di.displayExit) {
        var url = 'https://github.com/deployr',
            newLine = '\n';

        console.log(
            di.brand +
            newLine +
            'Good Bye!' +
            newLine +
            newLine +
            'The DeployR Team' + di.chalk.dim.yellow(' ♥  ' + url)
        );
    }
};

process.once('exit', di.exit.bind(this));