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
define(['modules/eyeApplications/eyeApplications'], function() {
	suite('Controller: ApplicationController', function(){
		var scope,
			emitSpy, fakeApp;
		setup(function() {
			// load the controller's module
			module('eyeApplications');

			// Initialize the controller and a mock scope
			inject(function ($controller, $rootScope) {
				scope = $rootScope.$new();
				$controller('ApplicationController', {
					$scope: scope
				});
			});
			emitSpy = sinon.spy(scope, "$emit");
			fakeApp = {"bigIcon":"http://img1.wikia.nocookie.net/__cb20091120083624/mafiawars/images/e/e5/Icon_experience_16x16_01.gif","smallIcon":"http://img1.wikia.nocookie.net/__cb20091120083624/mafiawars/images/e/e5/Icon_experience_16x16_01.gif","name":"app1","tooltip":"tooltipapp1","description":"description1","url":"http://ap1.com","_id":"53b6ae0609cd59094ca0309f"}
		});

		teardown(function () {
			emitSpy.restore();
		});

		test('openApp when called should send an openApp event with correct data when not in popup', function () {
			sinon.stub(scope, 'inPopupTopbar').returns(false);
			scope.app = fakeApp;
			scope.openApp(null, {
				currentTarget: []
			});
			assert.equal(emitSpy.calledOnce, true);
			assert.equal(emitSpy.calledWith('openApp', fakeApp), true);
		});

		test('openApp when called should send an openAppDetached event with correct data when in popup', function () {
			sinon.stub(scope, 'inPopupTopbar').returns(true);
			scope.app = fakeApp;
			scope.openApp(null, {
				currentTarget: []
			});
			assert.equal(emitSpy.calledOnce, true);
			assert.equal(emitSpy.calledWith('openAppDetached', fakeApp), true);
		});
	});
});


