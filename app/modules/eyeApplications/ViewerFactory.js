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

define([
	'app/appInfo',
	'appModule'
], function(AppInfo) {
	angular.module('eyeDesktopApp')
		.service('ViewerFactory', function () {

			var ViewerFactory = {

				getApp: function(data) {
					var app = new AppInfo("Viewer", "Viewer - "+data.name, "viewer application", "eyeos_application");
					app.setBigIcon("/viewer/images/viewer.png");
					app.setSmallIcon("/viewer/images/viewer.png");
					app.setTooltip("viewer");
					app.setUrl("/viewer/?file=" + encodeURIComponent(JSON.stringify(data.paths)));
					app.setSettings({
						"minSize": {
							"width": 620,
							"height": 430
						}
					});

					return app;
				}
			};

			return ViewerFactory;
		});
});
