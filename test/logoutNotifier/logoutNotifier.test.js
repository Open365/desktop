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

define([
	'modules/logoutNotifier/logoutNotifierController'
], function (LogoutNotifierController) {
	suite("LogoutNotifierController", function () {
		var sut;
		var logoutNotifierService, translate, bootstrapDialog;

		setup(function () {
			translate = {
				instant: function (a) {
					return a;
				}
			};

			logoutNotifierService = {
				addLogoutCallback: sinon.stub()
			};

			bootstrapDialog = {
				openModal: sinon.stub()
			};

			sut = new LogoutNotifierController(logoutNotifierService, translate, bootstrapDialog);
		});

		teardown(function () {

		});

		test("shows notification when logout detected", function () {
			logoutNotifierService.addLogoutCallback.yields();
			sut.init();
			sinon.assert.calledWithExactly(bootstrapDialog.openModal, {
				message: 'You have closed your session',
				cssClass: 'session-lost-dialog',
				buttons: [{
					label: 'Log in',
					cssClass: 'btn-primary qa-logout-notification-btn',
					action: sinon.match.func
				}]
			});
		});
	});
});
