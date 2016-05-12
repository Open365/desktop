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

define([
	'modules/netMeasure/netAnalyzer'
], function (NetAnalyzer) {
	suite("NetAnalyzer", function () {
		var sut;
		var settings;

		setup(function () {
			settings = {
				'MINIMUM_LATENCY': 2, //index of the minimum good latency of the LATENCY_SCALE
				'LATENCY_SCALE': [80, 40, 20, 10], //worst to best in ms
				'LATENCY_PING_INTERVAL': 1000,
				'LATENCY_HISTORY_SIZE': 10,
				'LATENCY_PINGS_TO_TRUNCATE': 1
			};

			sut = new NetAnalyzer(settings);
		});

		teardown(function () {

		});

		suite("#analyze", function () {

			var testData = [
				[1000, 1001, 5],
				[1000, 1019, 5],
				[1000, 1020, 4],
				[1000, 1039, 4],
				[1000, 1040, 3],
				[1000, 1079, 3],
				[1000, 1080, 2],
				[1000, 1159, 2],
				[1000, 1160, 1],
				[1000, 1261, 1]
			];

			testData.forEach(function (item, pos) {
				test("returns a result following the scales for success values " + pos, testReturnedDataFromScale(item[0], item[1], item[2]));

			});

			function testReturnedDataFromScale (init, end, expected) {
				return function () {
					var diff = end - init;

					sut.history = [];
					for (var i = 0; i < settings.LATENCY_HISTORY_SIZE; i++) {
						sut.history.push(diff);
					}

					var latencyData = {
						initTime: init,
						endTime: end
					};
					var result = sut.analyze(latencyData);
					assert.equal(expected, result);
				}
			}

			test("truncates the top and bottom elements to do the average", function () {
				var end = 1070, init = 1000, expected = 3;
				var diff = end - init;
				sut.history = [0, 0, 999999999999999];
				for (var i = 0; i < settings.LATENCY_HISTORY_SIZE - 3; i++) {
					sut.history.push(diff);
				}

				var latencyData = {
					initTime: init,
					endTime: end
				};
				var result = sut.analyze(latencyData);
				assert.equal(expected, result);

			});

			test("returns 0 if last petition is an error", function () {
				sut.history = [];
				for (var i = 0; i < settings.LATENCY_HISTORY_SIZE; i++) {
					sut.history.push(0);
				}

				var latencyData = {
					error: 1
				};
				var result = sut.analyze(latencyData);
				assert.equal(0, result);
			});

			testData = [
				// DATA ............... Expected
				[[0,0,0,0,0,0,0,0,0,-1], 0], // -1 in data means error
				[[0,0,0,0,0,0,0,0,-1,0], 0],
				[[0,0,0,0,0,0,0,-1,0,0], 1],
				[[0,0,0,0,0,0,-1,0,0,0], 1],
				[[0,0,0,0,0,-1,0,0,0,0], 2],
				[[0,0,0,0,-1,0,0,0,0,0], 2],
				[[0,0,0,-1,0,0,0,0,0,0], 3],
				[[0,0,-1,0,0,0,0,0,0,0], 3],
				[[0,-1,0,0,0,0,0,0,0,0], 4],
				[[-1,0,0,0,0,0,0,0,0,0], 4],
				[[-1,0,0,0,0,0,0,0,-1,0], 0],
				[[-1,0,0,0,0,-1,0,0,0,0], 1],
				[[-1,0,0,-1,0,0,0,0,0,0], 2],
				[[-1,-1,0,0,0,0,0,0,0,0], 3],
				[[-1,-1,-1,0,0,0,0,0,0,0], 1]
			];

			testData.forEach(function (item, pos) {
				test("returns a result considering the errors " + pos, testReturnedDataConsideringErrors(item[0], item[1]));
			});

			function testReturnedDataConsideringErrors (data, expected) {
				return function () {
					var err = {
						error: 1
					};
					data = data.map(function (item) {
						return !item ? item : err;
					});
					data.unshift(0);
					sut.history = data;


					var currentPing = data.pop();
					currentPing = currentPing || {
						initTime: 0,
						endTime: 0
					};

					var result = sut.analyze(currentPing);
					assert.equal(expected, result);
				}
			}
		});
	});
});
