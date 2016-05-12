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
define(['settings'],
	function (settings) {
		return function PeopleGroupsController($scope, peopleGroupsService, eyeosDesktopAuthService) {
			var currentUserName = eyeosDesktopAuthService.getUsername();
			$scope.currentUserName = currentUserName;
			$scope.enableUserSearch = settings.ENABLE_USER_SEARCH;
			$scope.contacts = [];

			function changeContactOnlineStatus (userId, status) {
				if (!$scope.contacts) {
					return;
				}


				$scope.contacts.forEach(function (contact) {
					if (contact.principalId === userId) {
						contact.online = status;
						$scope.$apply()
					}
				});
			}

			$scope.$on('togglePeople', function () {
				$scope.userSearch = '';
				$scope.searchUsers();
				$('#peopleSearch').focus();

			});

			DesktopBus.subscribe('push.onlineUser', function (event, data) {
				var userId = JSON.parse(data.data).user;
				changeContactOnlineStatus(userId, true);
			});

			DesktopBus.subscribe('push.offlineUser', function (event, data) {
				var userId = JSON.parse(data.data).user;
				changeContactOnlineStatus(userId, false);
			});

			var getDisplayName = function(user, noLastName) {
				if(!user) {
					return null;
				}
				if(user.displayName) {
					return user.displayName;
				} else if(user.firstName && user.lastName) {
					if (noLastName) {
						return user.firstName;
					}
					return user.firstName + ' ' + user.lastName;
				} else {
					return user.principalId;
				}
			};
			$scope.getDisplayName = getDisplayName;

			peopleGroupsService.getMe().then(function (user) {
				$scope.currentUser = user;
				user.displayName = getDisplayName(user);
				window.currentUser = user;
				localStorage.setItem('user-name', user.displayName);
			});

			function getContacts () {
				peopleGroupsService.getContacts().then(function (contacts) {
					$scope.contacts = contacts;
				});
			}

			getContacts();

			$scope.current = {
				group: {
					groupId: '',
					name: '',
					description: '',
					members: []
				}
			};

			$scope.enableCreateEditGroupWindow = false;

			$scope.createGroup = function (group) {
				$scope.current.group = {
					groupId: '',
					name: '',
					description: '',
					members: []
				};
				group.enableCreateEditGroupWindow = true;
				$scope.disableGroupEdition = false;

				$scope.$broadcast('showCreateEditGroupWindow.createMode', $scope.current.group);
			};

			$scope.showEditGroupWindow = function (group) {
				group.enableCreateEditGroupWindow = true;
				$scope.disableGroupEdition=true;

				$scope.$broadcast('showCreateEditGroupWindow.updateMode', $scope.current.group);
			};

			$scope.showDeleteDialog = function (group, confirmDeleteAction) {
				$scope.$broadcast('openDeleteGroupDialog', group, confirmDeleteAction);
			};


			function refreshGroupList () {
				$scope.userGroups = peopleGroupsService.groups;
			}

			$scope.$on('currentUserRemovedFromGroup', function (event, groupId) {
				var group =  peopleGroupsService.getGroupById(groupId);
				peopleGroupsService.removeGroupFromList(group);
				refreshGroupList();
				$scope.$apply();
			});

			$scope.$on('refreshGroupsList', refreshGroupList);

			window.DesktopBus.subscribe('contactsListUpdated', function (contacts) {
				$scope.contacts = contacts;
			});

			$scope.addContact = function (target) {
				if (target.online) {
					peopleGroupsService.addContact(target.principalId);
				}
			};

			$scope.searchUsers = _.throttle(function () {
				if ($scope.userSearch) {
					$scope.searchingUsers = true;
					peopleGroupsService.getUsersFiltered($scope.userSearch).then(function (data) {
						$scope.users = data;
					}, function (e) {
						console.log(e);
					});
				} else {
					$scope.searchingUsers = false;
					$scope.users = [];
				}
			}, 500);
		};
});
