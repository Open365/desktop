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
	'modules/netMeasure/workerPing',
	'modules/netMeasure/netAnalyzer'
], function (WorkerPing, NetAnalyzer) {

	function NetMeasurer(settings, workerPing, netAnalyzer) {
		this.settings = settings;
		this.workerPing = workerPing || new WorkerPing();
		this.netAnalyzer = netAnalyzer || new NetAnalyzer(settings);
		this.latencyValue = 5;
		this.started = false;
		this.callbacks = [];
	}

	NetMeasurer.prototype.subscribe = function (cb) {
		this.callbacks.push(cb);
	};

	NetMeasurer.prototype.start = function () {
		var self = this,
			latencyResult;

		this.workerPing.setPingInterval(function (data) {
			latencyResult = self.netAnalyzer.analyze(data);
			self.latencyValue = latencyResult;
			self.callbacks.forEach(function (cb) {
				cb(latencyResult);
			});
		}, this.settings.LATENCY_PING_INTERVAL, {
			timeout: this.settings.LATENCY_TIMEOUT
		});
	};

	NetMeasurer.prototype.isNetworkQualityGood = function () {
		var latency = this.latencyValue - 1;
		return latency >= this.settings.MINIMUM_LATENCY;
	};

	return NetMeasurer;
});
