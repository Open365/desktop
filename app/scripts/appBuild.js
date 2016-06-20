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
var eyeos = {};

require([
	'domReady', 'modules/eyeTheme/eyeThemeInfo', 'modules/eyeTheme/eyeThemeSettings'
], function (domReady, eyeThemeInfo, themeSettings) {
	domReady(function () {
		//theme logic here
		var productName = themeSettings.product;
        $.getJSON("products/" + productName + "/compiled-info.json", null, function(data) {
			var head = document.head;
			var cssElement = document.createElement("link");
			cssElement.setAttribute("rel", "stylesheet");
			cssElement.setAttribute("type", "text/css");
			cssElement.setAttribute("href", data.cssFile);
			head.appendChild(cssElement);

			eyeThemeInfo.setThemeInfo({
				modules: data.modules || [],
				hooks: data.hooks,
				addonTemplates: data.addonTemplates
			});
			//End theme logic

			require(['dependencyLoaderBuild']);
		});
	});
});
