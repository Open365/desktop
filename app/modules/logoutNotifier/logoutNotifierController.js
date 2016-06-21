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

define([], function () {
	function LogoutNotifierController(logoutNotifierService, $translate, dialogsService) {
		this.logoutNotifierService = logoutNotifierService;
		this.$translate = $translate;
		this.dialogsService = dialogsService;
	}

	LogoutNotifierController.prototype.init = function () {
		this.logoutNotifierService.addLogoutCallback(this.notifyLogout.bind(this));
	};

	LogoutNotifierController.prototype.notifyLogout = function () {
		this.dialogsService.openModal({
			message: this.$translate.instant('You have closed your session'),
			cssClass: 'session-lost-dialog',
			buttons: [{
				label: this.$translate.instant('Log in'),
				cssClass: 'btn-primary qa-logout-notification-btn',
				action: function () {
					location.href = "/applogin";
				}
			}]
		});
	};

	return LogoutNotifierController;
});
