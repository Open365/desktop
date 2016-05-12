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

"use strict";
define([
	'app/appInfo'
], function(AppInfo) {
	return function ApplicationServiceFactory($http) {
		return {
			getApplicationByName: function (name, cb) {
				this.getApplications(function (appsData) {
					for (var i = 0; i < appsData.length; i++) {
						if (appsData[i].name === name) {
							cb(appsData[i]);
							return;
						}
					}

					throw "Application not found error";
				});
			},

			getApplications: function (cb) {
				if (this._apps) {
					cb(this._apps);
					return;
				}

				var self = this;

				this.getAllApplications().then(function () {
					cb(self._apps);
				});
			},

			getAllApplications: function () {
				var self = this;
				var promise = $http.get('/application/v1/applications?no_cache=' + Date.now()).then(function (response) {
					var apps = [];

					for (var i = 0; i < response.data.length; i++) {
						var appData = response.data[i];
						var appInfo = new AppInfo(appData.appID, appData.name, appData.description, appData.type);
						appInfo.setIsVdi(appData.isVdi);
						appInfo.setSettings(appData.settings);
						appInfo.setShowInDesktop(appData.showInDesktop);
						appInfo.setShowInTab(appData.showInTab);
						appInfo.setBigIcon(appData.bigIcon);
						appInfo.setSmallIcon(appData.smallIcon);
						appInfo.setTooltip(appData.tooltip);
						appInfo.setType(appData.type);
						appInfo.setUrl(appData.url);
						appInfo.setMultipleInstances(appData.multipleInstances);
						apps.push(appInfo);
					}

					self._apps = apps;
					return apps;
				});

				this.getAllApplications = function () {
					return promise;
				};

				return promise;
			}
		};
	};
});
