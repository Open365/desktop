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
	function MembershipService ($http, $q, settings) {
		this.$http = $http;
		this.$q = $q;
		this.settings = settings;
	}

	MembershipService.prototype._constructDataToSend  = function(group, members) {
		var associations = [];
		for(var i = 0; i< members.length; i++) {
			associations.push({
				"groupId": group.id,
				"memberId": members[i]
			});
		}
		return associations;
	};

	MembershipService.prototype.addMembersToGroup = function(group, members) {
		if (!members || members.length === 0) {
			return this.$q.defer().resolve();
		}
		var memberIds = members.map(_.property('principalId'));

		var dataToSend = this._constructDataToSend(group, memberIds);
		return this.$http.post(this.settings.PRINCIPAL_SERVICE_URL + '/memberships', dataToSend);
	};

	MembershipService.prototype.removeMembersFromGroup = function(group, members) {
		if (!members || members.length === 0) {
			return this.$q.defer().resolve();
		}
		var memberIds = members.map(_.property('principalId'));

		var dataToSend = {
			"$and": [
				{ "groupId": group.id},
				{ "memberId": { "$in": memberIds} }
			]
		};
		return this.$http.delete(this.settings.PRINCIPAL_SERVICE_URL + '/memberships/?conditions='+JSON.stringify(dataToSend));
	};

	MembershipService.prototype.updateMembersFromGroup = function(group, membersToAdd, membersToRemove) {
		var addMembersPromise = this.addMembersToGroup(group, membersToAdd);
		var removeMembersPromise = this.removeMembersFromGroup(group, membersToRemove);

		return this.$q.all(addMembersPromise, removeMembersPromise);
	};



	return MembershipService;
});
