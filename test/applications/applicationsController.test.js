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
define(['appModule'], function() {
	suite('Controller: ApplicationsController', function(){
		var MainCtrl,
			scope, FAKE_MAX_APPS_DISPLAYED,
			originalLocalStorage,
			expectation, fakeApplicationList;
		setup(function() {
			originalLocalStorage = window.localStorage;
			window.localStorage = {};

			// load the controller's module
			module('eyeApplications');
			var injector = angular.injector(['eyeDesktopApp']);
			FAKE_MAX_APPS_DISPLAYED = 3;
			var ApplicationsService = injector.get('ApplicationsService');
			var ApplicationsServiceMock = sinon.mock(ApplicationsService);
			fakeApplicationList = [
				{
					icon: "https://10.11.12.100/eyeos/extern//images/icons/16x16/apps/welcomepage.png",
					name: "Application 1",
					settings: {
						fileExtensions: ["custom"]
					}
				},
				{
					icon: "https://10.11.12.100/eyeos/extern//images/icons/16x16/apps/welcomepage.png",
					name: "Application 2",
					settings: {
						fileExtensions: ["extension"]
					}
				},
				{
					icon: "https://10.11.12.100/eyeos/extern//images/icons/16x16/apps/welcomepage.png",
					name: "Application 3",
					settings: {}
				},
				{
					icon: "https://10.11.12.100/eyeos/extern//images/icons/16x16/apps/welcomepage.png",
					name: "Application 4",
					settings: {}
				},
				{
					icon: "https://10.11.12.100/eyeos/extern//images/icons/16x16/apps/welcomepage.png",
					name: "Application 5",
					settings: {}
				},
				{
					icon: "https://10.11.12.100/eyeos/extern//images/icons/16x16/apps/welcomepage.png",
					name: "Application 6",
					settings: {}
				}
			];
			expectation = ApplicationsServiceMock.expects("getAllApplications").once().returns({
				then:function(fp) {
					fp.call(MainCtrl, fakeApplicationList);
				}
			});

			// Initialize the controller and a mock scope
			inject(function ($controller, $rootScope, $interval) {
				scope = $rootScope.$new();
				MainCtrl = $controller('ApplicationsController', {
					$scope: scope,
					$interval: $interval,
					ApplicationsService: ApplicationsService,
					MAX_APPS_DISPLAYED: FAKE_MAX_APPS_DISPLAYED
				});
			});
		});

		teardown(function () {
			window.localStorage = originalLocalStorage;
		});

		test('calls ApplicationService.get once', function () {
			expectation.verify();
		});

		test('scope.app should contain an array with the first #MAX_APPS_DISPLAYED apps returned by app service', function () {
			assert.equal(scope.apps.length, FAKE_MAX_APPS_DISPLAYED);
		});

		test('showMoreApps when called should get a new app and remove the first one from the apps array', function () {
			scope.apps = fakeApplicationList;
			scope.showMoreApps();
			assert.deepEqual(scope.apps, [fakeApplicationList[1], fakeApplicationList[2], fakeApplicationList[3]]);
		});
		test('showMoreApps when called and reached maximum apps index should not do anything', function () {
			scope.apps = [fakeApplicationList[3], fakeApplicationList[4], fakeApplicationList[5]];
			scope.fistDisplayedApp = fakeApplicationList.length - FAKE_MAX_APPS_DISPLAYED;
			scope.showMoreApps();
			assert.deepEqual(scope.apps, [fakeApplicationList[3], fakeApplicationList[4], fakeApplicationList[5]]);
		});

		test('showLessApps when called when not scrolled down should not modify apps array', function () {
			scope.apps = fakeApplicationList;
			scope.fistDisplayedApp = 0;
			scope.showLessApps();
			assert.deepEqual(scope.apps, fakeApplicationList);
		});


		test('showLessApps when called after scrolled down should remove the last app and get a an old one inserting it at the begining', function () {
			scope.apps = fakeApplicationList;
			scope.fistDisplayedApp = 1;
			scope.lastDisplayedApp = scope.fistDisplayedApp + FAKE_MAX_APPS_DISPLAYED;
			scope.showLessApps();
			assert.deepEqual(scope.apps, [fakeApplicationList[0], fakeApplicationList[1], fakeApplicationList[2]]);
		});

		test('should add the file extensions to the localStorage', function () {
			assert.equal('["custom","extension"]', window.localStorage.vdiFileExtensions);
		});

	});
});


