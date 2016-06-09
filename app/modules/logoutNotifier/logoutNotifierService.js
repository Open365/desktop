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

define([], function () {
	function LogoutNotifierService () {
		this.callbacks = [];
	}

	LogoutNotifierService.prototype.init = function () {
		// Set the name of the hidden property and the change event for visibility
		var hidden, visibilityChange;
		if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
			hidden = "hidden";
			visibilityChange = "visibilitychange";
		} else if (typeof document.mozHidden !== "undefined") {
			hidden = "mozHidden";
			visibilityChange = "mozvisibilitychange";
		} else if (typeof document.msHidden !== "undefined") {
			hidden = "msHidden";
			visibilityChange = "msvisibilitychange";
		} else if (typeof document.webkitHidden !== "undefined") {
			hidden = "webkitHidden";
			visibilityChange = "webkitvisibilitychange";
		}

		var self = this;

		function handleVisibilityChange() {
			if (!document[hidden]) {
				if (!window.localStorage.card || !window.localStorage.signature) {
					self.notifyLogout();
				}
			}
		}

		document.addEventListener(visibilityChange, handleVisibilityChange, false);
	};

	LogoutNotifierService.prototype.notifyLogout = function () {
		this.callbacks.forEach(function (item) {
			item();
		});
	};

	LogoutNotifierService.prototype.addLogoutCallback = function (cb) {
		this.callbacks.push(cb);
	};

	return LogoutNotifierService;
});
