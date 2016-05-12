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
	'modules/workspaceVdiReconnection/vdiReconnectionFeedback',
	'translations/eyeosTranslator'
], function (VdiReconnectionFeedback, EyeosTranslator) {

	function VdiReconnectionSubscriptions(eyeosTranslator, desktopBus) {
		this.vdiReconnectionFeedback = new VdiReconnectionFeedback();
		this.translator = eyeosTranslator || EyeosTranslator.getInstance();
		this.bus = desktopBus || DesktopBus;
	}

	VdiReconnectionSubscriptions.prototype.subscribe = function (timer) {
		var message, translationsPromise;
		var self = this;
		var errorShown = false;
		var bus = this.bus;

		bus.subscribe('vdiconnect.error', function () {
			if (!errorShown) {
				errorShown = true;
				message = "Connection lost. Now trying to reconnect";
				translationsPromise = self.translator.translate([message]);

				translationsPromise.then(function (translations) {
					self.vdiReconnectionFeedback.blockVdiWindows(translations[message]);
				});
			}
		});

		bus.subscribe('vdiconnect.lost', function () {
			message = "VDI connection definitely lost. You may have lost some files changes";
			translationsPromise = self.translator.translate([message]);

			translationsPromise.then(function (translations) {
				self.vdiReconnectionFeedback.closeAllVdiWindows(translations[message]);
			});
		});

		bus.subscribe('vdiconnect.cancelError', function () {
			errorShown = false;
		});
	};

	return VdiReconnectionSubscriptions;
});
