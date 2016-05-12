/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';
define([
	'utils/serviceProvider'
], function (serviceProvider) {

	function TemplateCompiler($http, $compile) {
		this.$http = $http || serviceProvider.get('$http');
		this.$compile = $compile || serviceProvider.get('$compile');
	}

	TemplateCompiler.prototype.compile = function (tplFile, scope, callback) {
		var self = this;
		this.$http.get(tplFile).then(function (response) {
			var tmplString = response.data;
			var templateFunc = self.$compile(tmplString);
			var domElement = templateFunc(scope);
			callback(domElement);
		});
	};

	return TemplateCompiler;
});
