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

var chalk = require('chalk');

/**
 * Welcome to the DeployR CLI `di` prompt intro.
 * <pre>
 * ________                .__                __________ 
 * \______ \   ____ ______ |  |   ____ ___.__.\______   \
 * |    |  \_/ __ \\____ \|  |  /  _ <   |  | |       _/
 * |    `   \  ___/|  |_> >  |_(  <_> )___  | |    |   \
 * /_______  /\___  >   __/|____/\____// ____| |____|_  /
 *       \/     \/|__|               \/             \/ 
 * </pre>
 *
 * @mixin util/brand
 */
module.exports = chalk.cyan([
  '',
  '________                .__.               __________ ',
  '\\______ \\   ____ ______ |  |   ____ ___.__.\\______   \\ ',
  ' |    |  \\_/ __ \\\\____ \\|  |  /  _ <   |  | |       _/ ',
  ' |    `   \\  ___/|  |_> >  |_(  <_> )___  | |    |   \\ ',
  '/_______  /\\___  >   __/|____/\\____// ____| |____|_  / ',
  '        \\/     \\/|__|               \\/             \\\/ ',
  ''
].join('\n'));