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
define(['modules/eyeTheme/eyeThemeInfo'], function (eyeThemeInfo) {

	$.getJSON("modules/moduleFiles.json", null, function (moduleFiles) {
		var modules = Object.keys(eyeThemeInfo.getModules());

		// load modules
		var scriptPromises = modules.map(function (module) {
			return $.getScript(moduleFiles[module]);
		});

		var dependencies = modules.map(function (module) {
			return 'modules/' + module + "/" + module;
		});


		$.when.apply($, scriptPromises).done(function () {
			require(dependencies, function () {
				// start platform
				require('appModule');
			});
		});
	});

});
