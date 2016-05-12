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

define(['settings', 'urlConfig'], function (settings, urlConfig) {
	var themeName = urlConfig.EYETHEME_NAME || localStorage.getItem('EYETHEME_NAME') || settings.EYETHEME_NAME;

	return {
		theme: themeName,
		sassMode: settings.EYETHEME_SASS_MODE,
		paths: {
			themesPath: '/themes/',
			addonsPath: '/addons/',
			baseSassUrl: '../',
			requireTextPath: '../bower_components/requirejs-text/text'
		},
		requireConfig: {
			context: "themeRequire",
				baseUrl: "../bower_components/eyeos-theme/build-browser",
			paths: {
			platformReader: './readers/AjaxReader',
				sass: '../../sass.js/dist/sass.worker'
			}
		}
	};
});
