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

var di = require('../di');

//
// Configure `di` to use the `deployr-cli-server` plugin.
//
di.use(require('./plugins/deployr-cli-server'), {    
    before: {
        endpoint: function(details, next) {  
            next();            
        }
    },
    after: {
        endpoint: function(details, next) {
            //
            // Retrieve server details and store them
            //
            if (details && details.endpoint) {
                di.config.set('endpoint', details.endpoint);                
                di.config.save();
            }

            return next();
        },

        about: function(details, next) {
            var info     = details.info,
                yellow   = di.chalk.dim.yellow,
                username = di.config.get('username'),
                endpoint = di.config.get('endpoint')
            
            console.log(di.brand);

            if (info) {
                di.log.info('Version: ' + yellow(info.version + ' DeployR "' + 
                    (info.enterprise ? 'Enterprise' : 'Open') + '"'));
                di.log.info('Server: ' + yellow(endpoint));
                di.log.info('Build Date: ' + yellow(info.date));
            } else {
                di.log.warn('There is no DeployR server endpoint set. ' +
                    'Run `di endpoint` first.');
            }

            console.log(''); 

            return next();
        }
    }
});

//
// Configure `di` to use the `deployr-cli-users` plugin.
//
di.use(require('./plugins/deployr-cli-users'), {
    before: {
        login: function(details, next) {
            next();            
        },
        logout: function(details, next) {
            next();
        }
    },
    after: {
        login: function(details, next) {
            //
            // Retrieve authentication details and store them
            //
            if (details && details.username) {
                di.config.clear('password');
                di.config.set('username', details.username);
                di.config.set('cookie', details.cookie);
                di.config.save();                
            }

            return next();
        },
        logout: function(details, next) {
            di.config.clear('cookie');
            di.config.save();
            return next();
        }
    }
});

