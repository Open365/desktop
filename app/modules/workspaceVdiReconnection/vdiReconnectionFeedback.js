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
	'utils/desktopBus'
], function (DesktopBus) {
	function VdiReconnectionFeedback(bus) {
		this.bus = bus || DesktopBus;
	}

	VdiReconnectionFeedback.prototype.blockVdiWindows = function (message) {
		this.bus.dispatch('wm.windowDisplayMessage', {message: message, cssClass: 'msg-text__connection'});
	};

	VdiReconnectionFeedback.prototype.unblockVdiWindows = function () {
		this.bus.dispatch('wm.windowRemoveMessage');
	};

	VdiReconnectionFeedback.prototype.closeAllVdiWindows = function (message) {
		var self = this;

		BootstrapDialog.show({
			message: message,
			// Dialog closes only when the close icon in dialog header was clicked
			closeByBackdrop: false,
			closeByKeyboard: false,
			buttons: [{
				label: 'OK',
				action: function (dialog) {
					// close all windows
					self.bus.dispatch('wm.windowClose');
					dialog.close();
				}
			}]
		});
	};

	return VdiReconnectionFeedback;
});
