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

var Enum     = require('enum'),
    langEnum = new Enum(['JS', 'JAVA', 'DOTNET'], 'LangType');

/**
 * Defines the currently supported set of example `Languages`.
 *
 * @mixin
 * @alias util/lang-type
 */
module.exports = {
    /**
     * Javascript Language
     */
    JS: langEnum.Javascript,

    /**
     * Java Language
     */
    JAVA: langEnum.JAVA,

    /**
     * .NET Language
     */
    DOTNET: langEnum.DOTNET,

    /**
	 * Converts the string representation of the name to an equivalent 
	 * enumerated object.
	 */
	parse: function(name) {
		if (!name || typeof name !== 'string') { return null; }

		if (name.indexOf('js-') > -1) {
			return this.JS;
		} else if (name.indexOf('java-') > -1) {
			return this.JAVA;
		} else if (name.indexOf('dotnet-') > -1) {
			return this.DOTNET;
		} else {
			return null;
		}
	}
};
