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

var inquirer = require('inquirer');

/**
 * Bring `inquirer` behavior into the CLI.
 *
 * @mixin
 * @alias plugins/inquirer
 */
var cliInquirer = exports;


/**
 * Expose the plugin name _cli-inquirer_.
 * @property {String} name - The plugin name.
 */
cliInquirer.name = 'cli-inquirer';

/**
 * Attaches the `inquirer` behavior to the application. 
 * @params {Object} options - Options to use when attaching.
 */
cliInquirer.attach = function(options) {
    var app = this;
    options = options || {};   

    app.prompt.separator = function(msg) {
        return new inquirer.Separator(msg);
    };

    app.prompt.inquirer = function(choices, cb) {
        inquirer.prompt(choices, function(answers) {
            if (cb) {
                cb.call(this, answers);
            }
        });
    };
};

/**
 * Detaches this plugin from the application.
 */
cliInquirer.detach = function () {
    /* noop */
};