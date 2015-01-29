# deployr-cli

> The [DeployR](http://deployr.revolutionanalytics.com) command line interface. 

<img src="https://github.com/deployr/deployr-cli/raw/master/assets/di.png"/>

## Overview

DeployR CLI is a [Command Line Tool (CLI)](http://en.wikipedia.org/wiki/Command-line_interface) for running useful 
[DeployR](http://deployr.revolutionanalytics.com) utilities. Although the 
current feature set is minimal, many more CLI commands will be added going 
forward.

## Prerequisites

- Install the latest stable version of [Node.js](http://nodejs.org/) (version 0.10.x).
- A running [DeployR](http://deployr.revolutionanalytics.com/documents/admin/install) server to connect to.

## Installation

The DeployR CLI is installed and managed via [npm](http://npmjs.org), the [Node.js](http://nodejs.org/) package manager.

To get started, you will want to install the DeployR command line interface (CLI) 
globally. You may need to use sudo for (OSX, *nix, BSD, etc). If you are using 
Windows, run your command shell as Administrator.

One-line install using [npm](http://npmjs.org):

```
npm install -g deployr-cli
```

This will put the `di` command in your system path allowing it to be run from 
any location.

## Usage

DeployR CLI is self documenting and the best way to become familiar with the tool is to 
try it out from your command line:

```
di <resource> <action> <param1> <param2> ...
```

### Commands

 Command                                     | Purpose
 :------------------------------------------ | :-------
 `di`                                        | Displays the 'Main menu' User Interface.
 `di help`                                   | Prints out a list of available commands.
 `di help <command>`                         | Prints out the _help_ text associated with the command.
 `di endpoint`                               | Set the DeployR server endpoint.
 `di login`                                  | Log into DeployR.
 `di logout`                                 | Log out of DeployR.
 `di whoami`                                 | Displays the current logged in user to DeployR.
 `di install example`                        | Install a pre-built example.
 `di install example <name>`                 | Install a pre-built example by example name.
 `di about`                                  | Displays DeployR server information based on the set server `endpoint`.
 `di config`                                 | Allow you to edit your local `di` [configuration](#diconf-file) file.
 `di config list`                            | Lists all configuration values currently set in the configuration file.
 `di config set    <key> <value>`            | Sets the specified <key> <value> pair in the `di` configuration.
 `di config get    <key>`                    | Gets the value for the specified <key> in the `di` configuration.
 `di config delete <key>`                    | Deletes the specified <key> in the `di` configuration.
 
## Help

All commands have corresponding _help_ text associated with it. To read the help
text for a `di` command, type:

```
di help <command>
```

For example, to display the help text for the `whoami` command:

<img src="https://github.com/deployr/deployr-cli/raw/master/assets/whoami.png"/>

## .diconf file

All configuration data for your local DeployR CLI install is located in the *.diconf* 
file in your home directory. Directly modifying this file is not advised. You 
should be able to make all configuration changes from the _main menu_ UI or via:

```
di config
```

Example:

```
di config set endpoint http://dhost:port   # set the DeployR server endpoint
```

If you need to have multiple configuration files, use --diconf options.

Example:

```
di --diconf /path/to/other/configuration/.diconf
```

## Options

    di [commands] [options]
 
    --version             prints DeployR version and exit
    --diconf [file]       specify file to load configuration from
    --help                prints cli help and exit


## Notes

Inspired by the [nodejitsu](https://www.nodejitsu.com) CLI and others.

## License

Copyright (C) 2010-2015 by Revolution Analytics Inc.

This program is licensed to you under the terms of Version 2.0 of the Apache 
License. This program is distributed WITHOUT ANY EXPRESS OR IMPLIED WARRANTY, 
INCLUDING THOSE OF NON-INFRINGEMENT, MERCHANTABILITY OR FITNESS FOR A PARTICULAR 
PURPOSE. Please refer to the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0) for more details.
