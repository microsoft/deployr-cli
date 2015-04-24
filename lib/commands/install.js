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

var path     = require('path'),
    fs       = require('fs'),
    deployr  = require('deployr'),
    request  = require('request'),
    opn      = require('opn'),
    shell    = require('shelljs'),
    Download = require('download'),
    progress = require('download-status'),
    spinner  = require('char-spinner'),
    LangType = require('../util/lang-type'),
    di       = require('../../di'),
    conf     = di.config,
    // --- color aliases ---
    ul       = di.chalk.underline,
    dim      = di.chalk.dim,
    red      = di.chalk.red,
    gray     = di.chalk.gray,
    green    = di.chalk.green,
    yellow   = di.chalk.yellow,
    magenta  = di.chalk.magenta;

/**
 * Commands for installing and deploying starter examples.
 * @mixin
 * @alias commands/install
 */   
var install = exports;

/** 
 * Usage for the _di install *_ commands which allow you install and deploy
 * starter examples.
 * 
 * - di install example
 * - di install example <example name>
 */
install.usage = [
    'The `di install` command installs pre-built DeployR examples locally',
    '',
    'Example usages:',
    'di install example',
    'di install example <example name>'
];

/**
 * Installs a starter example.
 *
 * @param {String} exName - The example to install.
 * @param {Function} callback - Continuation to pass control when complete.
 */
install.example = function(exName, callback) {    
    var exConfig = {};

    //
    // Allows arbitrary amount of arguments
    //
    if (arguments.length) {
        var args = Array.prototype.slice.call([arguments], 0)[0];
        callback = args[arguments.length - 1];
        exName = args[0] || null;
    }
    
    function listExamples() {
        var interval   = spinner(),
            separator  = di.prompt.separator,
            jsList     = [],
            javaList   = [],
            dotNETList = [];

        request.get({
                url: conf.get('git').repos,
                headers: {
                    'User-Agent': 'Awesome-Octocat-App'
                }
            },
            function(err, res, body) {
                var found = false, choices = [];

                clearInterval(interval);

                if (err || res.statusCode != 200) {
                    return callback(err);
                }                

                try {
                    JSON.parse(body).forEach(function(repo, i) {
                        var name = repo.name;
                        if (name.indexOf('example') > -1) {
                            found = name === exName ? true : found;
                            switch (LangType.parse(name)) {
                                case LangType.JS:
                                    jsList.push({ name: '  ' + name });
                                    break;

                                case LangType.JAVA:
                                    javaList.push('  ' + name);
                                    break;

                                case LangType.DOTNET:
                                    dotNETList.push('  ' + name);
                                    break;
                            }
                        }
                    });

                    if (found) {
                        console.log('Installing example ' + ul(exName) + '\n');
                        installExample(exName, di.noop);
                        return;
                    }                    

                    if (jsList.length > 0) {
                        choices.push(separator('JavaScript Examples '));
                        choices.push(jsList);
                    }

                    if (javaList.length > 0) {
                        choices.push(separator());
                        choices.push(separator('Java Examples '));
                        choices.push(javaList);
                    }

                    if (dotNETList.length > 0) {
                        choices.push(separator('.NET Examples '));
                        choices.push(dotNETList);
                    }

                    choices.push(separator());
                    choices.push({
                        name: 'Take me back home!',
                        value: {
                            method: 'home'
                        }
                    });

                    di.prompt.inquirer([{
                        name: 'example',
                        type: 'list',
                        message: 'What example would you like to install?',
                        choices: di._.flatten(choices)
                    }], function(answer) {
                        if (!answer.example.method) {
                            installExample(answer.example.trim(), di.noop);
                        } else {
                            di.home();
                        }
                    }.bind(di));

                } catch (err) {
                    return callback(new Error(chalk.bold(
                        'A problem occurred installing the example from Github.' +
                        '\nUnable to parse response: not valid JSON.'
                    )));
                }
            }); 
    }

    function installExample(example) {        
        var download = new Download({
                extract: true,
                strip: 1,
                mode: '755'
            })
            .get(conf.get('git').example.replace('{{example}}', example))
            .dest(example)
            .use(progress());

        download.run(function(err, files, stream) {
            if (err) { callback(new Error(err)); }

            console.log(green.bold('✓ download complete.\n'));
            console.log(ul(example));

            var installer;

            switch (LangType.parse(example)) {
                case LangType.JS:
                    installer = function(next) {
                        console.log(yellow('\nResolving npm dependencies, this might take a while...\n'));
                        di.spawnCommand('npm', ['install', '--production', '--silent'])
                            .on('error', next)
                            .on('exit', next);
                    };
                    break;

                case LangType.JAVA:
                case LangType.DOTNET:
                    installer = function(next) { next(); }
                    break;
            }

            // be in the example dir for installation and running
            shell.cd(example);

            installer(function() {
                fs.exists(path.resolve('di-config.json'), function(exists) {
                    if (exists) {
                        agent();

                        deployr.io('/r/user/about')
                            .error(function() {
                                var end = !conf.get('endpoint') ?
                                    ' First identify your DeployR server endpoint.' : '';
                                console.log(yellow('\nAuthentication required to install.' + end + '\n'));

                                di.commands.login(function(err) {
                                    if (err) { return callback(err); }

                                    installation();                                    
                                }); 
                            })
                            .end(function() { installation(); });
                    } else { 
                        // no `di-config` file given, just the launch example
                        console.log('no di-config.json');
                        run();
                    }
                });
            });
        });

        function installation() {
            var config  = require(path.resolve('di-config.json')) || {},
                repos   = (config['app-install'] || {}).repository || [],
                dirs    = di._.uniq(repos, 'directory'),
                last    = dirs.length,
                success = 0;            

            exConfig = {
                example: example,
                repos: repos,
                auth: (config['app-run'] || {}).requireAuthentication || false,
                tutorial: (config['app-run'] || {}).tutorial || {}
            };

            if (repos.length > 0) {
                console.log(yellow('\nInstalling example analytics dependencies onto DeployR...\n'));
                agent();

                repos.forEach(function(item, index) {
                    console.log((index + 1) + '. ' +
                        ul(item.file.filename) + ' in directory ' +
                        ul(item.file.directory || 'root'));
                });
                console.log('');

                //
                // create directories for the dependencies, when done start the
                // upload/install of the analytic dependencies into DeployR
                //
                dirs.forEach(function(item) {
                    deployr.io('/r/repository/directory/create')
                        .data({ directory: item.file.directory })
                        .end(function() { success++; })
                        .ensure(function() {
                            if (success === last) { analytics(repos); }
                         });
                });
            } else { // othwise no dependencies just run the example            
                candidateToRun();
            }
        }

        function analytics(repos) {
            var last    = repos.length,
                success = 0,
                retry   = [];

            repos.forEach(function(item) {
                var file = item.file,
                    perm = item.permissions;                    

                deployr.io('/r/repository/file/upload')
                    .data({
                        filename: file.filename,
                        directory: file.directory || 'root',
                        restricted: perm.restricted || null,
                        shared: perm.shared || true,
                        published: perm.published || true,
                        newversion: true,
                        newversionmsg: 'DeployR CLI (examples) upload.'
                    })
                    .attach(path.resolve('analytics', file.filename))
                    .error(function(err) { callback(err); })
                    .end(function(res) {
                        var file = res.get('repository').file;

                        console.log(green.bold('✓ upload complete.\n'));
                        console.log(ul(file.filename) +
                            ' uploaded to directory ' +
                            ul(file.directory) +
                            ' for ' + dim(conf.get('username') + '@' + conf.get('endpoint')) +
                            '\n');
                        success++;
                    })
                    .ensure(function() {
                        if (success === last) {
                            console.log(green.bold('✓ installation complete.\n'));
                            candidateToRun();
                        }
                    });
            }); // foreach
        }

    } // end installExample

    function candidateToRun() {
        di.prompt.inquirer([{
            name: 'run',
            type: 'confirm',
            message: 'Would you like to run the example:'
        }], function(result) {
            if (result.run) {
                if (exConfig.auth) {
                    console.log('\nThis example requires ' +
                        magenta(conf.get('username')) +
                        '\'s password to run.\n');

                    verifyPassword(targets);
                } else {
                    targets();
                }
            }
        });
    }

    function verifyPassword(cb) {
        di.prompt.inquirer([{
            name: 'password',
            type: 'password',
            message: 'Password:',
            validate: function(input) {
                return input.length > 0 || 'Please enter a valid password.';
            }
        }], function(answer) {
            // confirm password
            di.prompt.inquirer([{
                name: 'password',
                type: 'password',
                message: 'Verify Password:'
            }], function(confirm) {
                if (answer.password === confirm.password) {
                    cb(confirm.password);
                } else {
                    console.log(red('>>') + ' Passwords do not match.\n');
                    verifyPassword(cb);
                }
            });
        });
    }

    function targets(pw) {
        var separator = di.prompt.separator;

        di.clearScreen();

        // tutorial type examples
        if (exConfig.tutorial.topics) {
            var choices = [separator()];

            choices.push({
                name: 'Example Documentation',
                value: {
                    help: exConfig.tutorial.help,
                }
            });

            exConfig.tutorial.topics.forEach(function(obj) {
                choices.push({
                    name: obj.topic,
                    value: {
                        menu: obj.menu
                    }
                });
            });

            choices.push(separator());

            choices.push({
                name: 'Take me back home!',
                value: 'home'
            });

            di.prompt.inquirer([{
                name: 'topic',
                type: 'list',
                message: 'Examples',
                choices: choices
            }], function(answer) {
                if (answer.topic === 'home') {
                    di.home();
                } else if (answer.topic.help) {
                    opn(answer.topic.help);
                    targets(pw);
                } else {
                    tutorialChoice(answer.topic.menu, pw);
                }
            });
        } else { // standalone example apps
            run({
                pw: pw
            });
        }
    }

    function tutorialChoice(menu, pw) {
        var separator = di.prompt.separator,
            choices   = [separator()].concat(menu.map(function(obj) {
                return {
                    name: obj.item,
                    value: {
                        test: obj.args
                    }
                };
            }));

        di.prompt.inquirer([{
            name: 'item',
            type: 'list',
            message: 'Examples to run?',
            choices: choices.concat([
                separator(), {
                    name: 'Take me back',
                    value: 'back'
                }
            ])
        }], function(answer) {
            if (answer.item === 'back') {
                return targets(pw);
            }
            run({
                pw: pw,
                tutorial: {
                    menu: menu,
                    example: answer.item.test
                }
            });
        });
    }

    function run(optArgs) {
        var args    = [],
            options = [],
            sep     = dim(ul('                                                           ')),
            cmd;

        optArgs = optArgs || {};        

        switch (LangType.parse(exConfig.example)) {
            case LangType.JS:
                cmd = 'npm';
                args = ['start'];

                process.env.endpoint = conf.get('endpoint');
                process.env.username = conf.get('username');
                process.env.password = optArgs.pw || '';
                process.env.testmod  = (optArgs.tutorial || {}).example;
                options = { env: process.env };

                break;

            case LangType.JAVA:
                cmd = (process.platform === 'win32' ? 'gradlew.bat' : './gradlew');
                args = [
                    'run',
                    '-Pendpoint=' + conf.get('endpoint') + '/deployr',
                    '-Pusername=' + conf.get('username'),
                    '-Ppassword=' + optArgs.pw || '',
                    '-DtestClass=' + (optArgs.tutorial || {}).example
                ];

                break;

            case LangType.DOTNET:
                break;
        }

        di.clearScreen();
        
        console.log(sep);

        di.spawnCommand(cmd, args, options)
            .on('error', function(err) {
                callback(err);
            })
            .on('close', function(err) {
                console.log(sep + '\n');
                di.prompt.inquirer([{
                    name: 'post',
                    type: 'list',
                    message: 'What do you want to do?',
                    choices: [{
                        name: 'Take me back',
                        value: 'back'
                    }, {
                        name: 'Run more examples',
                        value: 'more'
                    }]
                }], function(answer) {
                    di.clearScreen();

                    if (answer.post === 'back') {
                        tutorialChoice(optArgs.tutorial.menu, optArgs.pw);
                    } else {
                        targets(optArgs.pw);
                    }
                });
            });
    }

    //
    // Start to example installation workflow
    //
    listExamples();
};

/**
 * Output usage information describing commands for installing and deploying 
 * starter examples.
 */
install.example.usage = [
    'The `di install` command installs pre-built DeployR examples locally',
    '',
    'Example usages:',
    'di install example',
    'di install example <example name>'
];

function agent() {
    deployr.configure({
        host: conf.get('endpoint'),
        cookies: ['JSESSIONID=' + conf.get('cookie')],
        sticky: true
    });
}