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

var _    = require('lodash'),
   spawn = require('cross-spawn');

/**
 * Normalize a command across operating systems and spawn it.
 *
 * @mixin
 * @alias util/spawn-command
 */
module.exports = function spawnCommand(command, args, opt) { 
  return spawn(command, args, _.defaults({ stdio: 'inherit' }, opt || {}));
};
