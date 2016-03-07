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

if (process.platform === 'win32') {
    return;
}

var complete = require('complete');

/**
 * di install [<commands>]
 *   di install example
 *   di install example <example-name>
 *
 *  di server [<commands>]
 *   di endpoint
 *   di about
 *
 * di users [<commands>]
 *   di users confirm <username>
 *
 * di help [<commands>]
 *   di help users
 *   di help server
 *   di help config
 *   di help install
 *   di help login
 *   di help logout
 *   di help whoami
 *   di help endpoint
 *   di help about
 *
 * di config
 * di login
 * di logout
 * di whoami
 * di endpoint
 * di about
 */

/**
 * Lazy Loading
 */
function di() {
    if (!di.module) {
        di.module = require('../di');
        di.module.setup(function() {});
    }

    return di.module;
}

var commands = {
    // resource
    'users': {
        'login': {},
        'logout': {},
        'whoami': {}
    },
    'server': {
        'endpoint': {},
        'about': {}
    },
    'install': {
        'example': {}
    },
    'config': {
        'list': {},
        'set': {},
        'get': {},
        'delete': {}
    },
    'login': {},
    'logout': {},
    'whoami': {},
    'endpoint': {},
    'about': {},
    'help': {
        // resource
        'users': {
            'login': {},
            'logout': {},
            'whoami': {}
        },
        'server': {
            'endpoint': {},
            'about': {}
        },
        'install': {
            'example': {}
        },
        'config': {
            'list': {},
            'set': {},
            'get': {},
            'delete': {}
        },
        // commands under resource
        'login': {},
        'logout': {},
        'whoami': {},
        'endpoint': {},
        'about': {}
    }
};

var options = {
    '--version': {},
    '-v': {},
    '--diconf': {},
    '-j': {},
    '--help': {},
    '-h': {}
};

complete({
    program: 'di',
    commands: commands,
    options: options
});
