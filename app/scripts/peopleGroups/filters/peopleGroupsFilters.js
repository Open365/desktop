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


	 function compareStr (stra, strb){
		stra = ("" + stra).toLowerCase();
		strb = ("" + strb).toLowerCase();
		return stra.indexOf(strb) !== -1;
	}

	function compareByFields (object, fieldsArray, searchText) {
		for(var i = 0; i<fieldsArray.length; i++){
			var field = fieldsArray[i];
			if(object[field]){
				if(field instanceof Array) {
					field = field.toString();
				}
				if (compareStr(object[field], searchText)) {
					return true;
				}
			}
		}
	}

	return {
		removeMeFromEyeosUsersList: function(){
				return function(eyeosUsers, name){
					if(!eyeosUsers) return;
					var filteredUsers = [];

					for(var i = 0; i < eyeosUsers.length; i++){
						if(eyeosUsers[i].principalId !== name) {
							filteredUsers.push(eyeosUsers[i]);
						}
					}

					return filteredUsers;
				};
		},

		nonAssignmentFilter: function () {
			return function (userGroups) {
				if (!userGroups) {
					return [];
				}
				var result = [];
				userGroups.forEach(function (group) {
					if (!group.extra_params || !group.extra_params.tags || group.extra_params.tags.indexOf('subject') === -1) {
						result.push(group);
					}
				});

				return result;
			}
		},

		groupSearchFilter: function () {
			return function(userGroups, searchText){
				if(!searchText) return userGroups;
				var result = [];

				angular.forEach(userGroups, function(group){
					if(compareByFields(group, ['name' ,'description', 'membersIds'], searchText)){
						result.push(group);
					}
				});

				return result;

			};
		},

		peopleSearchFilter: function () {
			return function(users, searchText){
				if(!searchText) return users;
				var result = [];

				angular.forEach(users, function(user){
					if(compareByFields(user, ['principalId', 'firstName', 'lastName'], searchText)){
						result.push(user);
					}
				});

				return result;

			};
		}
	};
});
