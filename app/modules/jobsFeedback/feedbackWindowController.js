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
	function FeedbackWindowController(scope, bus, feedbackHook) {
		this.scope = scope;
		this.bus = bus || DesktopBus;
		var baseUrl = window.document.location.protocol + "//" + document.location.host;
		this.feedbackHook = feedbackHook || baseUrl + "/addons/feedback/templates/jobsFeedback.tpl.html";
	}

	FeedbackWindowController.getInstance = function (scope, bus) {
		if (!FeedbackWindowController.__instance__) {
			FeedbackWindowController.__instance__ = new FeedbackWindowController(scope, bus);
			FeedbackWindowController.__instance__.init();
		}
		return FeedbackWindowController.__instance__;
	};

	FeedbackWindowController.prototype.init = function () {
		var scope = this.scope;
		var self = this;

		scope.$on('feedbackWindowClosed', function () {
			scope.feedbackWindows = scope.feedbackWindows.filter(function (item) {
				return item !== 'jobFeedback';
			});
			scope.$apply();
		});
		this.bus.subscribe("jobs.changed", function (data) {
			if (!scope.feedbackWindows) {
				scope.feedbackWindows = [];
			}

			if (data.length) {
				if (scope.feedbackWindows.indexOf('jobFeedback') === -1) {
					scope.feedbackHook = self.feedbackHook;
					scope.feedbackWindows.push('jobFeedback');
				}
			} else {
				scope.feedbackWindows = scope.feedbackWindows.filter(function (item) {
					return item !== 'jobFeedback';
				});

				window.feedbackPopupWindow && window.feedbackPopupWindow.close();
			}
			setTimeout(function() {
				scope.$apply();
			}, 0);
		});
	};

	return FeedbackWindowController;
});
