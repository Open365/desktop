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

define(function() {
	function PeopleGroupsService ($http, $q, $timeout, membershipService, groupPermissionsService, peopleGroupsUpdateCardHandler, settings, $rootScope) {
		this.$http = $http;
		this.$q = $q;
		this.$timeout = $timeout;
		this.membershipService = membershipService;
		this.groupPermissionsService = groupPermissionsService;
		this.peopleGroupsUpdateCardHandler = peopleGroupsUpdateCardHandler;
		this.settings = settings;
		this.$rootScope = $rootScope;

		this.groups = [];

	}



	PeopleGroupsService.prototype.subscribeToChatNotifications = function (username) {
		var self = this;
		DesktopBus.subscribe('chat.started', function (data) {
			self.addContact(data);
		});
	};

	PeopleGroupsService.prototype.addContact = function (username) {
		var self = this;
		return this.$http.post(this.settings.PRINCIPAL_SERVICE_URL + '/principals/me/contacts/', {
			"username": username
		}).then(function (response) {
			return self.getContacts().then(function (contacts) {
				window.DesktopBus.dispatch('contactsListUpdated', contacts);
			});

		}, function (error) {
			console.log(error);
		});
	};

	PeopleGroupsService.prototype.getContacts = function () {
		return this.$http.get(this.settings.PRINCIPAL_SERVICE_URL + '/principals/me/contacts/').then(function (response) {
			return response.data;
		}, function (error) {
			console.log(error);
		});
	};

	PeopleGroupsService.prototype.getMe = function () {
		return this.$http.get(this.settings.PRINCIPAL_SERVICE_URL + '/principals/me').then(function (response) {
			return response.data;
		}, function (error) {
			console.log(error);
		});
	};

	PeopleGroupsService.prototype.getUsersFiltered = function (filter) {
		return this.$http.get(this.settings.PRINCIPAL_SERVICE_URL + '/principals/contacts/' + filter).then(function (response) {
			return response.data;
		}, function (error) {
			console.log(error);
		});
	};

	PeopleGroupsService.prototype.getAllUsers = function (cache)  {
		if (cache !== false) {
			cache = true;
		}

        var queryParams = '?select=-permissions%20-_id%20-__v%20-mustChangePassword'; // filter unwanted fields.
		return this.$http.get(this.settings.PRINCIPAL_SERVICE_URL + '/principals' + queryParams, { cache: cache}).then(function (response) {
			return response.data;
		}, function (error) {
			return error;
		});
	};

	PeopleGroupsService.prototype.getUserGroups = function() {
		var self = this;
		return this.$http.get(this.settings.PRINCIPAL_SERVICE_URL+'/workgroups/me').then(function (response) {
			self.groups = response.data;
			self.applyPermissionsToGroups();
			return self.groups;
		}, function (error) {
			return error;
		});
	};

	PeopleGroupsService.prototype.applyPermissionsToGroups = function (permissions) {
		if(!permissions){
			permissions = this.groupPermissionsService.getAllGroupsPermissions();
		}
		var group;
		for (var i = 0; i < this.groups.length; i++) {
			group = this.groups[i];
			group.admin = permissions[group.id] === "administrator";
		}

		return this.groups;
	};

	PeopleGroupsService.prototype.removeGroupFromList = function (group) {
		var indexToDelete = this.groups.indexOf(group);
		if (indexToDelete >= 0) {
			this.groups.splice(indexToDelete, 1);
		} else {
			console.error("deleting a group that doesn't exist");
		}
	};

	PeopleGroupsService.prototype.deleteGroup = function(group) {
		var self = this;
		return self.$http.delete(this.settings.PRINCIPAL_SERVICE_URL+'/workgroups/' + group.id)
			.then(function () {
				// VDI-2842: When deleting a group, more than one group is deleted from the list.

				// There's no need to delete the group from the list here, it will be removed by
				// peopleGroupsController when it receives the 'currentUserRemovedFromGroup' event.
				// Thanks to the double call and [].splice's behaviour when called with negative
				// indexes, the last group of the list was being deleted every time.

				// self.removeGroupFromList(group);
				return true;
			}, function (response) {
				return response.data;
			});
	};


	PeopleGroupsService.prototype.createGroup = function(group) {
		var self = this,
			createGroupPromise;

		createGroupPromise = this.$http.post(this.settings.PRINCIPAL_SERVICE_URL+'/workgroups',
			{
				name: group.name,
				description: group.description
			})
			.then(function (response) {
				group.id = response.data._id;

				var addCreatedGroup = function () {
					self.$timeout(function () {
						self.groups.push(group);
						self.applyPermissionsToGroups();
						self.$rootScope.$broadcast('refreshGroupsList');
					}, 0);
					return group;
				};

				var handler = self.membershipService.addMembersToGroup.bind(self.membershipService, group, group.members);

				return self.peopleGroupsUpdateCardHandler.addHandler(group.id, handler, addCreatedGroup);

			}, function (response) {
				return self.$q.reject(response.data);
			});

		return createGroupPromise;
	};


	PeopleGroupsService.prototype.updateGroup = function(group, membersToAdd, membersToRemove) {
		var self = this;

		return this.$http.put(this.settings.PRINCIPAL_SERVICE_URL+'/workgroups/'+group.id, {
			name: group.name,
			description: group.description
		}).then(function () {

			var returnUpdatedGroup = function () {
				var cachedGroup = self.getGroupById(group.id);
				return angular.extend(cachedGroup, group);
			};

			//var handler = self.membershipService.updateMembersFromGroup.bind(self.membershipService, group,  membersToAdd, membersToRemove);
			//return self.peopleGroupsUpdateCardHandler.addHandler(group.id, handler, returnUpdatedGroup);

			return self.membershipService.updateMembersFromGroup(group, membersToAdd, membersToRemove)
				.then(returnUpdatedGroup);

		});
	};

	PeopleGroupsService.prototype.getGroupById = function(groupId) {
		for(var i = 0; i < this.groups.length; i++) {
			if(this.groups[i].id === groupId) {
				return this.groups[i];
			}
		}
		return null;
	};

	return PeopleGroupsService;
});
