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
	function PeopleGroupsUpdateCardHandler ($scope) {
		this.queueActions = {};
		var self = this;
		$scope.$on('push.renewCard', function (data) {
			self.executeAllHandlers();
		});
	}

	PeopleGroupsUpdateCardHandler.prototype.clearByGroupId = function (groupId)  {
		this.queueActions[groupId] = [];
	};

	PeopleGroupsUpdateCardHandler.prototype.addHandler = function(groupId, handler, callback) {
		if(!this.queueActions[groupId]){
			this.queueActions[groupId] = [];
		}
		var action = {
			"handler": handler,
			"successCallback": callback
		};
		this.queueActions[groupId].push(action);
	};

	PeopleGroupsUpdateCardHandler.prototype.execute = function(groupId) {
		var queue = this.queueActions[groupId];
		for(var i = 0; i < queue.length; i++) {
			var handler = queue[i].handler;
			var successCallback = queue[i].successCallback;

			var actionResult = handler();

			if(actionResult && actionResult.then) {
				actionResult.then(successCallback);
			}else {
				successCallback();
			}
		}

		this.clearByGroupId(groupId);

	};


	PeopleGroupsUpdateCardHandler.prototype.executeAllHandlers = function() {
		for(var groupId in this.queueActions) {
			this.execute(groupId);
		}
	};


	return PeopleGroupsUpdateCardHandler;
});
