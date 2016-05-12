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
	'modules/jobsFeedback/templatePopupDirective',
	'modules/jobsFeedback/filesFeedbackController',
	'modules/jobsFeedback/feedbackWindowController',
	'modules/jobsFeedback/jobsService'
], function (templatePopupDirective, FilesFeedbackController, FeedbackWindowController, JobsService) {
	angular.module('jobsFeedback', [])
		.controller('feedbackWindowController', ['$scope','jobsService', function ($scope) {
			FeedbackWindowController.getInstance($scope);
		}])

		.controller('filesFeedbackController',
		['$scope', '$translate', 'jobsService', '$http', function ($scope, $translate, jobsService, $http) {
			var inst = new FilesFeedbackController($scope, $translate, jobsService, $http);
			inst.init();
		}])

		.service('jobsService', ['$http', function ($http) {
			var serv = new JobsService($http);
			serv.init();
			return serv;
		}])

		.directive('templatepopup', ['WindowManagerService', '$compile', templatePopupDirective]);
});
