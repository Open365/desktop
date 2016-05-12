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
define([], function () {
	function JobsService ($http, bus) {
		this.$http = $http;
		this.bus = bus || DesktopBus;
		this.jobs = [];
	}

	JobsService.prototype.init = function () {
		this.bus.subscribe("push.jobs.updated", this.updateJob.bind(this));
		this.bus.subscribe("push.jobs.added", this.updateJob.bind(this));
		this.bus.subscribe("push.jobs.removed", this.removeJob.bind(this));

		this.populateModel();
	};

	JobsService.prototype.populateModel = function () {
		var self = this;
		this.$http.get("/jobs/v1/api/jobinfos").success(function (data) {
			var curatedData = [];
			data.forEach(function (doc) {
				var executorBody = (doc.executor && doc.executor.body) || {};
				var statusBody = doc.statusBody || {};
				var notificationBody = executorBody;
				for (var key in statusBody) {
					if (!statusBody.hasOwnProperty(key)) {
                        return;
                    }
					notificationBody[key] = statusBody[key];
				}

				var userId = doc.owner.id;
				var newData = {
					id: doc._id,
					status: doc.status,
					statusTs: doc.statusTs,
					name: doc.name,
					body: notificationBody
				};
				console.log(newData);
				curatedData.push(newData);
			});
			self.jobs = curatedData;
			self.bus.dispatch("jobs.changed", self.jobs);
		});
	};

	JobsService.prototype.removeJob = function (data) {
		this.jobs = this.jobs.filter(function (item) {
			return item.id !== data.id;
		});
		this.bus.dispatch("jobs.changed", this.jobs);
	};

	JobsService.prototype.updateJob = function (data) {
		var found = false;
		this.jobs = this.jobs.map(function (item) {
			if (item.id === data.id) {
				found = true;
				return data;
			}
			return item;
		});
		if (!found) {
			this.jobs.push(data);
		}
		this.bus.dispatch("jobs.changed", this.jobs);
	};

	JobsService.prototype.getJobs = function () {
		return this.jobs;
	};

	JobsService.prototype.getJob = function (id) {
		var jobs = this.jobs;
		for (var i = 0; i < jobs.length; i++) {
			if (jobs[i].id === id) {
				return jobs[i];
			}
		}
	};

	return JobsService;
});
