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

define(['peopleGroups/controllers/peopleGroupsController',
		'peopleGroups/controllers/groupController',
		'peopleGroups/controllers/deleteGroupDialogController',
		'peopleGroups/controllers/groupCreateController',
		'peopleGroups/controllers/groupCreateUpdateController',
		'peopleGroups/services/peopleGroupsService',
		'peopleGroups/services/membershipService',
		'peopleGroups/services/groupPermissionsService',
		'peopleGroups/filters/peopleGroupsFilters',
		'peopleGroups/services/peopleGroupsUpdateCardHandler'
	],
	function (peopleGroupsController, groupController, deleteGroupDialogController, groupCreateController, groupCreateUpdateController, peopleGroupsService, membershipService, groupPermissionsService, peopleGroupsFilters, peopleGroupsUpdateCardHandler) {

		angular.module("peopleGroupsModule", [
			'eyeApplications',
			'eyeosDesktopAuth',
			'settings',
			'eyeosTranslationModule'
		])
			.filter('removeMeFromEyeosUsersList', peopleGroupsFilters.removeMeFromEyeosUsersList)
			.filter('groupSearchFilter', peopleGroupsFilters.groupSearchFilter)
			.filter('nonAssignmentFilter', peopleGroupsFilters.nonAssignmentFilter)
			.filter('peopleSearchFilter', peopleGroupsFilters.peopleSearchFilter)

			.controller("peopleGroupsController", ['$scope', 'peopleGroupsService',
				'eyeosDesktopAuthService', peopleGroupsController])
			.controller("groupController", [
				'$scope',
				'peopleGroupsService',
				'ApplicationsService',
				groupController
			])
			.controller("deleteGroupDialogController", [
				'$scope',
				deleteGroupDialogController
			])
			.controller("groupCreateController", [
				'$scope',
				'peopleGroupsService',
				'$translate',
				groupCreateController
			])
			.controller("groupCreateUpdateController", [
				'$scope',
				'peopleGroupsService',
				'$translate',
				groupCreateUpdateController
			])

			.service('peopleGroupsService', [
				'$http',
				'$q',
				'$timeout',
				'membershipService',
				'groupPermissionsService',
				'peopleGroupsUpdateCardHandler',
				'SETTINGS',
				'$rootScope',
				function ($http, $q, $timeout, membershipService, groupPermissionsService, peopleGroupsUpdateCardHandler, settings, $rootScope) {
					var pplService = new peopleGroupsService($http, $q, $timeout, membershipService, groupPermissionsService, peopleGroupsUpdateCardHandler, settings, $rootScope);
					pplService.subscribeToChatNotifications();
					return pplService;

				}
			])
			.service('membershipService', ['$http', '$q', 'SETTINGS', membershipService])
			.service('groupPermissionsService', [groupPermissionsService])
			.service('peopleGroupsUpdateCardHandler', ['$rootScope', peopleGroupsUpdateCardHandler])
	});
