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
define(function() {

	function FakeDesktopBus () {
		this.callbacks = {}
	}

	FakeDesktopBus.prototype.dispatch = function (topic, data) {
		(this.callbacks[topic]||[]).forEach(function (cb) {
			cb(data);
		});
	};

	FakeDesktopBus.prototype.subscribe = function (topic, cb) {
		if (!this.callbacks[topic]) {
			this.callbacks[topic] = [cb];
		} else {
			this.callbacks[topic].push(cb);
		}

		return topic + "_" + (this.callbacks[topic].length - 1);
	};

	return FakeDesktopBus;
});
