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
	'settings'
], function (DesktopBus, settings) {

	function EyeosVdiReconnectionService (customSettings, desktopBus) {
		this.DesktopBus = desktopBus || DesktopBus;
		this.subscriptions = [];
		this.settings = customSettings || settings;
		this.vdiClient = null;
	}

	EyeosVdiReconnectionService.prototype.setVdiClient = function (vdiclient) {
		this.vdiClient = vdiclient;
	};

	EyeosVdiReconnectionService.prototype.connectErrorSubscription = function () {
		var self = this;
		var alreadyTryingToReconnect = false;
		this.subscriptions.push(this.DesktopBus.subscribe('wm.connect.error', function (e) {
			alreadyTryingToReconnect = false;

			if (e.code === 4200 && e.type === "close") {
				// reset vdiClient
				self.DesktopBus.dispatch('vdiconnect.error');
				self.resetVdiClient();
				self.DesktopBus.dispatch('connectNewApp');

				return;
			}

			console.log('VdiReconnectionService-> wm.connect.error');
			if (!self.vdiClient.getReconnecting()) {
				if (self.settings.VDI_RECONNECTION_FREEZE) {
					if (!self.cancelFreezeTimer) {
						self.cancelFreezeTimer = setTimeout(function () {
							self.DesktopBus.dispatch('vdiconnect.error');
							console.log('VdiReconnectionService-> cancelFreeze');
							self.vdiClient.cancelFreeze();
						}, self.settings.VDI_RECONNECTION_FREEZE_TIME);
					}
				} else {
					self.DesktopBus.dispatch('vdiconnect.error');
				}
				if (!self.cancelReconnectionTimer) {
					self.cancelReconnectionTimer = setTimeout(function () {
						self.DesktopBus.dispatch('vdiconnect.lost');
						console.log('VdiReconnectionService-> cancel reconnection');
						self.dispose();
					}, self.settings.VDI_RECONNECTION_CANCEL_TIME);
				}
			}

			if (!self.intervalTimer) {
				self.intervalTimer = setInterval(function() {
					if (alreadyTryingToReconnect) {
						return;
					}

					alreadyTryingToReconnect = true;
					console.log('VdiReconnectionService-> Trying reconnect');
					self.vdiClient.reconnect({
						freeze: self.settings.VDI_RECONNECTION_FREEZE
					});
				}, self.settings.VDI_RECONNECTION_RETRY_TIME);
			}

		}));
	};

	EyeosVdiReconnectionService.prototype.connectReadySubscription = function() {
		var self = this;
		this.subscriptions.push(this.DesktopBus.subscribe('wm.connect.ready', function() {
			console.log('VdiReconnectionService-> vdiReady');
			self.vdiClient.setReconnecting(false);
			self.DesktopBus.dispatch('vdiconnect.cancelError');
			self.clearTimers();
		}));
	};

	EyeosVdiReconnectionService.prototype.start = function ($rootScope) {
		this.connectErrorSubscription();
		this.connectReadySubscription();
	};



	EyeosVdiReconnectionService.prototype.clearTimers = function () {
		clearTimeout(this.cancelReconnectionTimer);
		clearTimeout(this.cancelFreezeTimer);
		clearInterval(this.intervalTimer);
		this.cancelReconnectionTimer = null;
		this.cancelFreezeTimer = null;
		this.intervalTimer = null;
	};

	EyeosVdiReconnectionService.prototype.resetVdiClient = function () {
		this.clearTimers();
		this.vdiClient.dispose();
		this.vdiClient.init();
	};

	EyeosVdiReconnectionService.prototype.dispose = function () {
		this.clearTimers();

		this.subscriptions.forEach(function (sub) {
			sub.unsubscribe();
		});

		this.vdiClient.dispose();
	};


	return EyeosVdiReconnectionService;
});
