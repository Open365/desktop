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
	'modules/jobsFeedback/filesFeedbackController',
	'modules/jobsFeedback/filesFeedbackFactory',
	'modules/jobsFeedback/jobsService'
], function (FilesFeedbackController, FilesFeedbackFactory, JobsService) {

	suite("FilesFeedbackController", function () {
		var sut, bus, scope, jobs, feedbackData, jobsService, translate, $http, postPromise;
		var filesFeedbackFactory, processAllStub;

		setup(function () {
			postPromise = {
				then: function () {}
			};

			$http = {
				post: sinon.stub()
			};

			$http.post.returns(postPromise);

			jobs = [{
				id: 1
			}];

			jobsService = new JobsService(bus);
			sinon.stub(jobsService, 'getJobs').returns(jobs);

			filesFeedbackFactory = new FilesFeedbackFactory();
			feedbackData = [{
				id: 'foo',
				title: 'bar',
				actions: {
					accept: 'onAccept'
				}
			}];

			processAllStub = sinon.stub(filesFeedbackFactory, "processAll").returns(feedbackData);

			scope = {
				$apply: function () {}
			};
			bus = new FakeDesktopBus();
			sut = new FilesFeedbackController(scope, translate, jobsService, $http, bus, filesFeedbackFactory);
		});

		teardown(function () {

		});

		suite("#init", function () {
			test("calls to jobsService.getJobs", function () {
				sut.init();
				sinon.assert.calledOnce(jobsService.getJobs);
			});

			test("adds the current data in the jobsService to the scope", function () {
				sut.init();
				assert.deepEqual(scope.feedbackData, feedbackData);
			});

			test("calls filesFeedbackFactory.process with the jobs", function () {
				sut.init();
				sinon.assert.calledWithExactly(filesFeedbackFactory.processAll, jobs);
			});
		});

		suite("#init on jobs.changed event", function () {
			test("calls filesFeedbackFactory.process with the jobs", function () {
                sut.init();
				bus.dispatch("jobs.changed", jobs);
				sinon.assert.calledWithExactly(filesFeedbackFactory.processAll, jobs);
			});

			test("adds the feedback data to the scope", function () {
				var customData = ["CUSTOM_DATA"];
				processAllStub.returns(customData);
				sut.init();
				bus.dispatch("jobs.changed", jobs);
				assert.deepEqual(scope.feedbackData, customData);

			});
		});
	});
});
