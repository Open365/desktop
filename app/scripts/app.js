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
	'domReady', 'modules/eyeTheme/eyeThemeSettings', 'modules/eyeTheme/eyeThemeInfo'
], function (domReady, themeSettings, eyeThemeInfo) {
	domReady(function () {
		var themeName = themeSettings.theme;
		var themeRequire = require.config(themeSettings.requireConfig);

		if (themeSettings.sassMode === "server") {
			var head = document.head;
			var cssElement = document.createElement("link");
			cssElement.setAttribute("rel", "stylesheet");
			cssElement.setAttribute("type", "text/css");
			cssElement.setAttribute("href", "/styles/" + themeName + ".css");
			head.appendChild(cssElement);
		}

		themeRequire([
			'ThemeFactory',
			'BrowserSassCompiler',
			'SassFetcher',
			'sass'
		], function (ThemeFactory, BrowserSassCompiler, SassFetcher) {
			var settings = themeSettings.paths;

			var themeFactory = new ThemeFactory(settings);
			themeFactory.getTheme(themeName, function (err, theme) {
				var a = document.createElement('a');
				a.href = "";
				a.protocol = location.protocol;
				a.host = location.host;
				function convertToAbsolute (hookUrl) {
					a.pathname = hookUrl;
					return a.href;
				}

				function convertHooksToAbsolutePath (hooks) {
					for (var key in hooks) {
						if (!hooks.hasOwnProperty(key)) {
							continue;
						}

						hooks[key] = convertToAbsolute(hooks[key])
					}

					return hooks;
				}
				//console.log('sass: ', theme.getSass());
				//console.log('hooks: ', theme.getHooks());
				//console.log('modules: ', theme.getModules());
				eyeThemeInfo.setThemeInfo({
					modules: theme.getModules(),
					hooks: convertHooksToAbsolutePath(theme.getHooks()),
					addonTemplates: theme.getAddonTemplates()
				});

				if (themeSettings.sassMode === "server") {
					return;
				}

				var sasss = theme.getSass();

				var sassFetcher = new SassFetcher(settings);
				sassFetcher.fetchSass(sasss, function (err, scssData) {
					var browserSassCompiler = new BrowserSassCompiler();
					browserSassCompiler.compile(scssData, function (err, css) {
						if (typeof css === "object") {
							console.log("========================================================================================================================");
							console.error("SCSS compilation error:");
							console.log("\tline:", css.line);
							console.log("\tmessage:", css.message);
							console.log("View orignial scss:");
							console.log('data:text/css;charset=UTF-8,' + encodeURIComponent(scssData));
							console.log("========================================================================================================================");
						}

						// Create style element with the css data
						var head = document.head,
							style = document.createElement('style');

						style.type = 'text/css';
						if (style.styleSheet) {
							style.styleSheet.cssText = css;
						} else {
							style.appendChild(document.createTextNode(css));
						}

						head.appendChild(style);
						require(['dependencyLoaderDev']);
					});
				});
			});
		});
	});
});
