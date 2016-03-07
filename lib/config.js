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

var path = require('path'),
    di   = require('../di');

//
// Update env for Windows
//
if (process.platform == 'win32') {
    process.env.HOME = process.env.USERPROFILE;
}

//
// Setup target file for `.diconf`.
//
try {
    di.config.env().file({
        file: di.argv.diconf || di.argv.j || '.diconf',
        dir: process.env.HOME,
        search: true
    });
} catch (err) {
    console.log('Error parsing ' + di.chalk.magenta(di.config.stores.file.file));
    console.log(err.message);
    console.log('');
    console.log('Please check the .diconf file and try again');
    console.log('');
    process.exit(1);
}

var restricted = ['git'];

//
// Set defaults for `diconfig`.
//
di.config.defaults({
    homepage: 'http://go.microsoft.com/fwlink/?LinkID=692163',
    git: {
        repos: [ 'java-example-client-basics',     
                 'java-example-client-data-io',
                 'java-example-fraud-score',      
                 'java-example-fraud-score-basics',
                 'java-example-rbroker-basics',
                 'java-example-rbroker-data-io',                 
                 'js-example-fraud-score',
                 'js-example-fraud-score-basics'                 
        ],        
        example: 'https://github.com/Microsoft/{{example}}/archive/master.zip',
        cli: 'http://github.com/Microsoft/deployr-cli'
    }
});

//
// Use the `flatiron-cli-config` plugin for `di config *` commands.
//
di.use(require('flatiron-cli-config'), {

    //
    // Name of the store in `di.config` to use for `config list`.
    // 
    //
    store: 'file',

    //
    // Set of properties which cannot be deleted using `config delete <key>`
    //
    restricted: restricted,

    //
    // Set of functions which will execute before named commands:
    // get, set, list, delete
    //
    before: {
        set: function(key) {
            if (di._.contains(restricted, key)) {
                di.log.warn('Cannot set reserved key ' + key.yellow);
                return false;
            } else {
                return true;
            }
        },

        list: function() {
            var username = di.config.get('username'),
                confFile = di.config.stores.file.file,
                display  = [
                    'Hello ' + di.chalk.green(username) +
                    ' here is the ' + di.chalk.grey(confFile) + ' file:',
                    'To change a property type:',
                    'di config set <key> <value>',
                ];

            display.forEach(function(line) {
                di.log.help(line);
            });

            return true;
        }
    }
});
