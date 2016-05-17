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

define([], function () {
	function WorkerPing(worker) {
		this.worker = worker;
		this.callbacks = [];
	}

	WorkerPing.prototype.getNewWorker = function () {
		return new Worker('worker/pinger.js');
	};

	WorkerPing.prototype.startWorker = function () {
		var self = this;
		if (this.worker) {
			this.worker.terminate()
		}
		this.worker = this.getNewWorker();
		this.worker.onmessage = function (e) {
			self.callbacks.forEach(function (cb) {
				cb(e.data);
			});
		};
	};

	WorkerPing.prototype.startPing = function (options) {
		this.startWorker();
		if (!options) {
			options = {};
		}
		this.worker.postMessage({
			target: options.target,
			time: options.time,
			timeout: options.timeout || 5000
		});
	};

	WorkerPing.prototype.addCallback = function (cb) {
		this.callbacks.push(cb);
	};

	return WorkerPing;
});
