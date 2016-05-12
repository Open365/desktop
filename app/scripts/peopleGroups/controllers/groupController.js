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

"use strict";
define([],
	function () {

		return function GroupController($scope, peopleGroupsService, applicationsService) {

			$scope.deleteGroup = function () {
				$scope.showConfirmDelete = true;
				$scope.current.group = $scope.group;
				$scope.showDeleteDialog($scope.group, $scope.confirmDeleteGroup);
			};

			$scope.confirmDeleteGroup = function () {
				peopleGroupsService.deleteGroup($scope.group);
				$scope.showConfirmDelete = false;
			};

			$scope.cancelDeleteGroup = function () {
				$scope.showConfirmDelete = false;
			};

			$scope.openFiles = function (){
				applicationsService.getApplications(function (appsData) {
					var found = false;
					var app;
					for (var i = 0; i < appsData.length && !found; i++) {
						app = appsData[i];
						found = app.name === "Files";
					}
					if (found) {
						app = angular.copy(app);
						app.url += "?path=workgroup://" + encodeURIComponent($scope.group.name) + "/";
						$scope.$emit('openApp', app);
					}
				});
			};

			$scope.editGroup = function () {
				$scope.current.group = $scope.group;
				$scope.showEditGroupWindow();
			};

			//edit form in group
			$scope.showEditGroupWindowInGroup = function (group) {
				$scope.showOnlyMembers = true;
				group.enableCreateEditGroupWindow = true;
				$scope.disableGroupEdition=true;

				$scope.$broadcast('showCreateEditGroupWindow.updateMode', $scope.current.group);
			};

			$scope.editGroupInGroup = function (group) {
				$scope.current.group = group;
				$scope.showEditGroupWindowInGroup(group);
			};
		};
	});
