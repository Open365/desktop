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

define(['modules/jobsFeedback/filesFeedbackFactory'], function (FilesFeedbackFactory) {
	function FilesFeedbackController($scope, $translate, jobsService, $http, bus, filesFeedbackFactory) {
		this.$http = $http;
		this.jobsService = jobsService;
		this.translate = $translate;
		this.scope = $scope;
		this.bus = bus || DesktopBus;
		this.filesFeedbackFactory = filesFeedbackFactory || new FilesFeedbackFactory(this.translate);
	}

	FilesFeedbackController.prototype.init = function () {
		var self = this;

		this.scope.feedbackData = self.filesFeedbackFactory.processAll(this.jobsService.getJobs());

		this.bus.subscribe("jobs.changed", function (jobs) {
			self.scope.feedbackData = self.filesFeedbackFactory.processAll(jobs);
			try {
				self.scope.$apply();
			} catch (e) {
			}

		});

		this.scope.actions = {
			move_overwrite: function (job) {
				self.moveForce(job);
			},
			deleteFeedback: function (job) {
				self.cancelJob(job);
			},
			copy_overwrite: function (job) {
				self.copyForce(job);
			}
		}
	};

	FilesFeedbackController.prototype.cancelJob = function (jobFeedback) {
		if (!jobFeedback || !jobFeedback.id) {
			return;
		}
		this.$http.delete('/jobs/v1/api/jobinfos/' + jobFeedback.id);
	};

	FilesFeedbackController.prototype.actionForce = function (action, jobFeedback) {

		var job = this.jobsService.getJob(jobFeedback.id);

		if (!job) {
			return;
		}

		var baseUrl = "/files/v2/files/";
		var url = baseUrl + encodeURIComponent(job.body.target) + "/" + action + "Job";

		var postData = JSON.stringify({
			source: job.body.source,
			force: true
		});

		this.$http.post(url, postData);
		this.cancelJob(jobFeedback);
	};

	FilesFeedbackController.prototype.copyForce = function (jobFeedback) {
		this.actionForce('copy', jobFeedback);
	};

	FilesFeedbackController.prototype.moveForce = function (jobFeedback) {
		this.actionForce('move', jobFeedback);
	};

	return FilesFeedbackController;
});
