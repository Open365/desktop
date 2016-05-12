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

define(['modules/presence/request', 'settings'], function (Request, settings) {
	function PresenceController(request) {
		this.request = request || new Request();
		this.settings = settings;
		this.intervalId = false;
	}

	/**
	 *  PRIVATE
	 */

	function connectOk () {
		console.log('ping sent');
	}

	function connectError () {
		console.log('ping error');
	}

	/**
	 *  End PRIVATE
	 */

	PresenceController.prototype.init = function () {
		if (!this.intervalId) {
			console.log('start presence');
			var self = this;
			var presence = function () {
				self.request.send('POST', url, connectOk, connectError);
			};
			var url = this.settings.PRESENCE_SERVICE_URL;
			presence();
			this.intervalId = setInterval(presence, this.settings.PRESENCE_PING_INTERVAL);
		} else {
			console.log('presence is executing...');
		}
	};

	PresenceController.prototype.stop = function () {
		console.log('stop presence');
		window.clearInterval(this.intervalId);
		this.intervalId = null;
	};

	PresenceController.prototype.pong = function () {
		console.log('pong received');
	};

	PresenceController.prototype.getDataForPresenceEvent = function (methodReference) {
		return [
			{ eventName: 'pong', callback: methodReference || this.pong.bind(this) }
		];
	};

	return PresenceController;
});
