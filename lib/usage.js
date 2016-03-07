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

var chalk = require('chalk'),
    cyan  = chalk.cyan,
    ul    = cyan.bold.underline;

module.exports = [
  require('./util/brand'),  

  'The CLI for DeployR - Simple R analytics integration for application developers',
  'open-source and fully customizable',
  'https://github.com/Microsoft/deployr-cli',

  '',

  ul('Usage:'),
  '',
  '  di <resource> <action> <param1> <param2> ...',
  '',

  ul('Common Commands:'),

  '',

  cyan('Main menu'),
  '  di',
  '',

  cyan('To set the DeployR server endpoint'),
  '  di endpoint',
  '',  

  cyan('To log into DeployR'),
  '  di login',
  '',

  cyan('To install a pre-built example'),
  '  di install example',
  '',

  ul('Additional Commands'),
  '  di whoami',
  '  di logout',
  '  di about',  
  '  di config',    
  '  di users',
  '  di server'
];