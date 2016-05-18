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
	'modules/netMeasure/workerPing'
], function (WorkerPing) {
	suite("WorkerPing", function () {
		var sut, worker;

		setup(function () {
			worker = {
				postMessage: sinon.stub(),
				terminate: sinon.stub()
			};
			sut = new WorkerPing(worker);

			sinon.stub(sut, "getNewWorker").returns(worker);
		});

		teardown(function () {

		});

		suite("#startPing", function () {
			test("calls worker.postMessage with the time and options", function () {
				var timeout = 2000;
				var time = 1000;
				var target = "fakeTarget";

				var expected = {
					target: target,
					time: time,
					timeout: timeout
				};
				var options = {
					target: target,
					time:  time,
					timeout: timeout
				};

				sut.startPing(options);

				sinon.assert.calledWithExactly(worker.postMessage, expected);

			});
		});
	});

});
