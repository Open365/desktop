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

		return function GroupCreateUpdateController($scope, peopleGroupsService, $translate) {

			$scope.membersToAdd = [];
			$scope.membersToRemove = [];

			$scope.getMembersCount = function () {
				var membersCount = 0;
				if($scope.group && $scope.group.members){
					membersCount = $scope.group.members.length;
				}
				return membersCount;
			};

			$scope.showLongMembersList = function () {
				return $scope.getMembersCount() > 1;
			};

			$scope.addMember = function (user) {
				if(!$scope.isMember(user)){
					$scope.group.members.push(user);
					$scope.membersToAdd.push(user);
				}
			};

			$scope.removeMember = function (user) {
				if($scope.isMember(user)){
					var indexToRemove = _.findIndex($scope.group.members, {principalId: user.principalId});
					$scope.group.members.splice(indexToRemove, 1);
					$scope.membersToRemove.push(user);
				}
			};

			$scope.isMember = function (user) {
				if($scope.group) {
					return !! _.findWhere($scope.group.members, {principalId: user.principalId});
				}
				return false;
			};

			$scope.saveGroupWithUsers = function () {
				$scope.current.group.enableCreateEditGroupWindow = false;
				$scope.group.enableCreateEditGroupWindow = false;
				if(!$scope.group.id){
					peopleGroupsService.createGroup($scope.group)
						.then(function(){
							$scope.$emit('refreshGroupsList');
						})
						.catch(displayErrorMessage);
				}else{
					peopleGroupsService.updateGroup($scope.group, $scope.membersToAdd, $scope.membersToRemove)
						.then(function(){
							$scope.$emit('refreshGroupsList');
						});
				}
			};

			$scope.cancelEdition = function () {
				$scope.current.group.enableCreateEditGroupWindow = false;
				$scope.current.group = {
					groupId: '',
					name: '',
					description: '',
					members: []
				};
			};

			$scope.initGroupsModel = function (newCurrentGroup) {
				$scope.group = angular.copy(newCurrentGroup);
				$scope.addMember($scope.currentUser);
				$scope.membersToAdd = [];
				$scope.membersToRemove = [];
				$scope.showOnlyMembers = false;
			};

			$scope.$on('showCreateEditGroupWindow.createMode', function (event, newCurrentGroup) {
				$scope.initGroupsModel(newCurrentGroup);
                $scope.disableGroupNameEdition = false;
                $scope.disableGroupDescriptionEdition = false;
			});

            $scope.$on('showCreateEditGroupWindow.updateMode', function (event, newCurrentGroup) {
                $scope.initGroupsModel(newCurrentGroup);
                $scope.disableGroupNameEdition = true;
                $scope.disableGroupDescriptionEdition = false;
            });

			function displayErrorMessage (errorMessage) {
				$translate(errorMessage.code, { workgroup: errorMessage.workgroupName})
					.then(function successTranslateCallback(msg) {
						BootstrapDialog.show({
							message: msg,
							buttons: [{
								label: 'OK',
								action: function (dialog) {
									dialog.close();
								}
							}]
						});
					});
			}
		};
	});
