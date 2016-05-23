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
	'modules/cloudApp/cloudResizer',
	'modules/cloudApp/spiceCallback',
    'settings'
], function (CludResizer, SpiceCallback, settings) {
	function SpiceConnector (appName, eyeosVdiReconnectionService) {
		this.eyeosVdiReconnectionService = eyeosVdiReconnectionService;
		this.vdiContainerName = 'home-container';
		this.spiceReady = false;
		this.appName = appName;
	}

	SpiceConnector.prototype.connect = function () {
		this.initSpiceClient();
		this.generateToken();
		this.configReconnectionService();
		this.prepareResize();
		this.ensureAlwaysVdiFocus();
		this.listenToEvents();
		this.connectApp();
	};

	SpiceConnector.prototype.listenToEvents = function () {
		var self = this;
		window.DesktopBus.subscribe('push.readyMessage', function (data) {
			console.log("The remote machine is ready");
			if (data.token === self.token) {
				self.spiceReady = true;
				if (self.vdiParams) {
					self.runVdiApp(self.vdiParams);
				}
			}
		});

		window.DesktopBus.subscribe('connectNewApp', function () {
			self.connectApp();
		});
	};

	SpiceConnector.prototype.connectApp = function () {
		var self = this;
		this.spiceReady = false;
		this.launchRemoteApp(function (response) {
			self.vdiParams = JSON.parse(response);
			console.log("Got the remote machine data");
			if (self.spiceReady) {
				self.runVdiApp(self.vdiParams);
			}
		});
	};

	SpiceConnector.prototype.generateToken = function () {
		this.token = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	SpiceConnector.prototype.initSpiceClient = function () {
		this.spiceClient = new window.Application({
			supportHighDPI: !!settings.SUPPORT_HIGH_DPI,
			spiceClientPath: settings.SPICE_CLIENT_PATH
		});
	};

	SpiceConnector.prototype.configReconnectionService = function () {
		// Reconnection service uses eyeosVdiClient by default, but we want to use the
		// spice client directly, so we pass our app instance as VdiClient, that shares the
		// reconnection API with the eyeosVdiClient.
		this.eyeosVdiReconnectionService.setVdiClient(this.spiceClient);
	};

	SpiceConnector.prototype.prepareResize = function () {
		this.resizer = new CludResizer(this.spiceClient, this.vdiContainerName);
		this.resizer.prepareAutoResize();
	};

	SpiceConnector.prototype.ensureAlwaysVdiFocus = function () {
		var self = this;
		// Focus logic
		if (!this.focusInterval) {
			this.focusInterval = window.setInterval(function () {
				if(!self.spiceClient.disposed) {
					self.spiceClient.disableKeyboard();
					self.spiceClient.enableKeyboard();
				} else {
					window.clearInterval(self.focusInterval);
				}
			}, 100);
		}
	};

	SpiceConnector.prototype.launchRemoteApp = function (callback) {
		var container = $('#' + this.vdiContainerName);
		var resolution = this.spiceClient.toSpiceResolution({
			width: container.width(),
			height: container.height()
		});
		var resolutionParam = "?width=" + resolution.width + "&height=" + resolution.height + "&scaleFactor=" + resolution.scaleFactor;
		var noCacheParam = "&no_cache=" + Date.now();

		$.ajax({
			headers: {
				card: localStorage.card,
				minicard: localStorage.minicard,
				signature: localStorage.signature,
				minisignature: localStorage.minisignature
			},
			url: "/appservice/v1/" + this.appName + "/token/" + this.token + resolutionParam + noCacheParam

		}).done(callback);
	};

	SpiceConnector.prototype.runVdiApp = function (data) {
		console.log('VDI connection data', data);

		var wsHost = data.wsHost || document.domain;
		window.DesktopBus.dispatch('netMesure.newPingTarget', wsHost);

		var spiceCallback = new SpiceCallback(this.spiceClient, this.resizer);
		spiceCallback.subscribe();

		var runParams = {
			layer: document.getElementById(this.vdiContainerName),
			'callback': spiceCallback.callback,
			'context': spiceCallback,
			'host': wsHost,
			'port': 443,
			'protocol': data.protocol,
			'token': data.token,
			'vmHost': data.host,
			'vmPort': data.port,
			'useBus': true,
			'busHostList': [{
				'host': data.busHost,
				'port': data.busPort
			}],
			'busSubscriptions': data.busSubscriptions,
			'busUser': data.busUser,
			'busPass': data.busPass,
			'layout': 'es',
			'clientOffset': {
				'x': 0,
				'y': -50
			},
			'useWorkers': true,
			'seamlessDesktopIntegration': false,
			'vdiBusToken': false,
			'checkActivityInterval': settings.CHECK_ACTIVITY_INTERVAL
		};

		this.spiceClient.run(runParams);
	};

	return SpiceConnector;
});
