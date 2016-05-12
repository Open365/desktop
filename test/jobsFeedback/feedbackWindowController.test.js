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

define(['modules/jobsFeedback/feedbackWindowController'], function (FeedbackWindowController) {
	suite("FeedbackWindowController", function () {
		var sut, bus, scope, jobs, origWindow, feedbackHook;

		setup(function () {
			origWindow = window.feedbackPopupWindow;
			window.feedbackPopupWindow= {
				close: sinon.stub()
			};

			feedbackHook = "fakeHook";
			jobs = [{
				id:1
			}];
			scope = {
				$apply: function () {},
				$on: sinon.stub()
			};
			bus = new FakeDesktopBus();
			sut = new FeedbackWindowController(scope, bus, feedbackHook);
		});

		teardown(function () {
			window.feedbackPopupWindow = origWindow;
		});

		suite("#init on jobs.changed event", function () {
			test("adds feedbackWindows to scope when there is jobs and no feedbackWindow", function () {
                sut.init();
				bus.dispatch("jobs.changed", jobs);
				assert.deepEqual(scope.feedbackWindows, ['jobFeedback']);
			});

			test("removes feedbackWindow from scope when there is no jobs", function () {
				sut.init();
				bus.dispatch("jobs.changed", jobs);
				bus.dispatch("jobs.changed", []);
				assert.deepEqual(scope.feedbackWindows, []);
			});

			test("doesn't add an other widow when it already exists", function () {
				sut.init();
				bus.dispatch("jobs.changed", jobs);
				bus.dispatch("jobs.changed", jobs);
				assert.deepEqual(scope.feedbackWindows, ['jobFeedback']);
			});

			test("closes the current feedback window when no jobs remaingin", function () {
				sut.init();
				bus.dispatch("jobs.changed", []);
				sinon.assert.called(window.feedbackPopupWindow.close);
			});

			test("adds feedbackHook to the scope", function () {
				sut.init();
				bus.dispatch("jobs.changed", jobs);
				assert.deepEqual(scope.feedbackHook, feedbackHook);
			});
		});

		suite("#init on feedbackWindowClosed", function () {
			test("removes feedbackWindow from scope", function () {
				var cb;
				scope.$on = function (type, callback) {
					cb = callback;
				};
				sut.init();
				bus.dispatch("jobs.changed", jobs);
				cb();
				assert.deepEqual(scope.feedbackWindows, []);
			});
		});
	});
});
