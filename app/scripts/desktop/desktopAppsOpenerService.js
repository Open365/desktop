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
	'utils/desktopBus',
	'windows/busWindowManager',
	'utils/ProtocolResolver',
	'utils/VdiPathManager',
	'desktop/desktopNotificationHandler'

], function(DesktopBus, BusWindowManager, ProtocolResolver, VdiPathManager, DesktopNotificationHandler) {

	function OpenAppsService () {
		this.openedApps = [];

		this.bus = DesktopBus;

		this.bus.subscribe('push.runApp', this.runAppFromBus, this);

		this.busWindowManager = new BusWindowManager(this.bus, 'wm');

		this.desktopNotificationHandler = new DesktopNotificationHandler();
	}

	OpenAppsService.prototype.openApp = function (app, openAppCb) {
		app.id = Date.now();
		var found = false;

		if (!app.multipleInstances) {
			for (var i = 0; i < this.openedApps.length; i++) {
				if (this.openedApps[i].name === app.name) {
					found = true;
					break;
				}
			}
		}

		if (!found) {
			this.openedApps.push(app);
		}

		openAppCb();
	};

	OpenAppsService.prototype.runAppFromBus = function(data) {
		var app = {
			'name': 'application',
			'tooltip': 'application',
			'description': 'application',
			'url': data,
			'isVdi': true,
			'type': 'eyeos_vdi_application',
			'openType': 'detached_application',
			'showInTab': false,
			'showInDesktop': true
		};
		this.openApp(app);
	};

	OpenAppsService.prototype.closeApp = function (app) {
		var appIndex = this.openedApps.indexOf(app);
		this.openedApps.splice(appIndex, 1);
	};

	OpenAppsService.prototype.getOpenedApp = function (app) {
		for(var i = 0; i < this.openedApps.length; i++) {
			if(this.openedApps[i].id === app.id) { //get by id 'cause passed app can be different
				return this.openedApps[i];
			}
		}
	};

	return OpenAppsService;
});
