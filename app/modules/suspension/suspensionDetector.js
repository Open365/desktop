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

define(['settings'],function(settings) {
	function SuspensionDetector () {
		this.onAwake = [];
		this.intervalId = null;
	}

	SuspensionDetector.prototype.start = function ()  {
		// Each x seconds we get the time.
		// If the difference is bigger than delta seconds means that the user has suspended the computer
		var self = this;

		var lastDate = Date.now();
		this.intervalId = setInterval(function () {
			var now = Date.now();
			if(now - lastDate > settings.SUSPENDED_MAX_TIME_AWAY) {
				console.warn('Computer suspended');
				self.onAwake.forEach(function (action) {
					action();
				});
			}
			lastDate = now;
		}, settings.CHECK_SUSPENDED_INTERVAL);

	};

	SuspensionDetector.prototype.addOnAwakeAction = function (action)  {
		this.onAwake.push(action);
	};

	SuspensionDetector.prototype.stop = function ()  {
		clearInterval(this.intervalId);
	};

	return SuspensionDetector;
});
