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

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define([
	'modules/netMeasure/netMeasureService',
	'modules/netMeasure/workerPing',
	'modules/netMeasure/netAnalyzer'
], function (NetMeasurer, WorkerPing, NetAnalyzer) {
	suite("netMeasureService", function () {
		var sut;
		var clock;
		var settings;
		var workerPing, workerPingStub;
		var netAnalyzer, analyzeStub;

		setup(function () {
			clock = sinon.useFakeTimers(Date.now());
			settings = {
				'MINIMUM_LATENCY': 2, //index of the minimum good latency of the LATENCY_SCALE
				'LATENCY_TIMEOUT': 2000, // in ms
				'LATENCY_SCALE': [160, 80, 40, 20], //worst to best in ms
				'LATENCY_PING_INTERVAL': 1000, // in ms
				'LATENCY_HISTORY_SIZE': 10, // Pings to keep to do the average
				'LATENCY_PINGS_TO_TRUNCATE': 1,
			};

			workerPing = new WorkerPing();
			workerPingStub = sinon.stub(workerPing, 'setPingInterval');

			netAnalyzer = new NetAnalyzer(settings);
			analyzeStub = sinon.stub(netAnalyzer, 'analyze');

			sut = new NetMeasurer(settings, workerPing, netAnalyzer);
		});

		teardown(function () {
			clock.restore();
		});

		suite("#start", function () {
			test('calls workerPing.setPingInterval with callback, time and options', function () {
				sut.start();
				var options = {
					timeout: settings.LATENCY_TIMEOUT
				};
				sinon.assert.calledWithExactly(workerPingStub, sinon.match.func, settings.LATENCY_PING_INTERVAL, options);
			});

			test('workerPing.setPingInterval callback calls netAnalyzer with the data', function () {
				var fakeLatencyResult = {};
				workerPingStub.callsArgWith(0, fakeLatencyResult);
				sut.start();
				sinon.assert.calledWithExactly(analyzeStub, fakeLatencyResult);
			});

			test('workerPing.setPingInterval callback calls the subscription callbacks with the analyze result', function () {
				var latencyResult = 4;
				var fakeLatencyResult = {};
				workerPingStub.callsArgWith(0, fakeLatencyResult);
				analyzeStub.returns(latencyResult);

				var cb = sinon.stub();
				sut.subscribe(cb);

				sut.start();
				sinon.assert.calledWithExactly(cb, latencyResult);

			});

		});

		suite('#isNetworkQualityGood', function () {
			var TestCase = [ 5, 4, 3 ];
			TestCase.forEach(function (value) {
				test('returns true if latencyValue = ' + value, function () {
					sut.latencyValue = value;
					assert.isTrue(sut.isNetworkQualityGood());
				});
			});

			TestCase = [ 2, 1, 0 ];

			TestCase.forEach(function (value) {
				test('returns false if latencyValue = ' + value, function () {
					sut.latencyValue = value;
					assert.isFalse(sut.isNetworkQualityGood());
				});
			});
		});
	});
});
