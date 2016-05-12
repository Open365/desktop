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

define(['modules/jobsFeedback/jobsService'], function (JobsService) {
	suite("JobsService", function () {
		var sut, bus, sentData, changedData, newData, $http, promise, get;

		setup(function () {
			promise = {
				success: sinon.stub()
			};

			get = sinon.stub().returns(promise);

			$http = {
				get: get
			};

			bus = new FakeDesktopBus();
			sut = new JobsService($http, bus);
			sentData = {
				id: "foo",
				title: "bar",
				status: "baz"
			};
			changedData = {
				id: "foo",
				title: "CHANGED",
				status: "baz"
			};
			newData = {
				id: "foo2",
				title: "bar2",
				status: "baz2"
			};
		});

		teardown(function () {

		});

		function generateDispatchEvent (eventName) {
			test("sends jobs.changed event with the jobs", function () {
				var called = false;
				var eventData;
				bus.subscribe("jobs.changed", function (data) {
					called = true;
					eventData = data;
				});

				sut.jobs = ['FAKE', 'JOBS'];

				sut.init();
				bus.dispatch(eventName, sentData);

				assert.isTrue(called, "jobs.changed event never fired");
				assert.deepEqual(eventData, sut.jobs);

			});
		}

		function generateUpdateJobsTests (eventName) {
			suite("#init on " + eventName + " event", function () {
				test("adds the item to the jobs list when it doesn't exist", function () {
					sut.init();
					bus.dispatch(eventName, sentData);
					var jobs = sut.getJobs();
					assert.deepEqual(jobs, [sentData]);
				});

				test("updates the job when it already exists", function () {
					sut.init();
					bus.dispatch(eventName, sentData);
					bus.dispatch(eventName, changedData);
					var jobs = sut.getJobs();
					assert.deepEqual(jobs, [changedData]);
				});

				generateDispatchEvent(eventName);
			});
		}

		generateUpdateJobsTests("push.jobs.updated");
		generateUpdateJobsTests("push.jobs.added");

		suite("#init on push.jobs.removed", function () {
			test("removes the item from the jobs list", function () {
				sut.init();
				bus.dispatch("push.jobs.added", sentData);
				bus.dispatch("push.jobs.added", newData);
				bus.dispatch("push.jobs.removed", sentData);
				var jobs = sut.getJobs();
				assert.deepEqual(jobs, [newData]);
			});

			generateDispatchEvent("push.jobs.removed");
		});

		suite("#init", function () {
			test("calls to populate model", function () {
				sinon.stub(sut, 'populateModel');

				sut.init();

				sinon.assert.calledOnce(sut.populateModel);
			});
		});

		suite("#getJob", function () {
			test("returns the job with the passed ID", function () {
				var expected = {id: 1};
				sut.jobs = [expected, {id:2}];
				var result = sut.getJob(1);
				assert.deepEqual(result, expected);
			});

			test("doesn't return any job when the id doesn't match", function () {
				sut.jobs = [{id: 2}];
				var result = sut.getJob(1);
				assert.isUndefined(result);
			});
		});
	});
});
