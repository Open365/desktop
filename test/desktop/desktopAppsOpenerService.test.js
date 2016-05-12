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
define([
	'desktop/desktopAppsOpenerService',
	'utils/ProtocolResolver',
	'utils/VdiPathManager',
	'desktop/loading/loadingService'
], function(openAppsService, ProtocolResolver, VdiPathManager, LoadingService) {
	suite('Service: OpenAppsService', function () {
		var sut,
			busWindowManager,
			loadingService;

		setup(function () {
			busWindowManager = {add: function (){}};
			loadingService = new LoadingService();
			sut = new openAppsService(loadingService);
		});


		function constructApp(id) {
			return {
				id: id || 'anApp',
				eyeWindow: {
					signals: {
						on: function () {
						}
					},
					close: function () {}
				}
			};
		}

		suite('#openApp', function () {
			var app;

			setup(function () {
				app = {url: 'vdi://anApp'};
				window.netMeasurer = {
					isNetworkQualityGood: function () {
						return true;
					}
				};
			});

			function exercise (app) {
				sut.openApp(app, function() {});
			}

			function exerciseVdiApp () {
				this.stub(sut, 'isVDI').returns(true);
				exercise(app);
			}

			test('when is not a vdi app should save the app in openedApps', sinon.test(function () {
				var simpleApp = {
					name:'anApp',
					id:"an id"
				};
				exercise(simpleApp);
				assert.equal(sut.openedApps[0], simpleApp);
			}));
		});

		suite('closeApp', function(){
			var app, app2, app3;
			function exercise () {
				sut.closeApp(app2);
			}
			test('when called should remove app from array with passed index', sinon.test(function(){
				app = constructApp();
				app2 = constructApp();
				app3 = constructApp();
				sut.openedApps = [app, app2, app3];
				exercise();
				assert.equal(sut.openedApps.indexOf(app2), -1);
			}));
		});

		suite('getOpenedApp', function(){
			var app;

			function exercise () {
				return sut.getOpenedApp(app);
			}

			test('when called should remove app from array with passed index', sinon.test(function(){
				var app1 = constructApp('anId_1');
				app = constructApp();
				sut.openedApps = [app1, app];

				var returnedApp = exercise();

				assert.equal(returnedApp, app);
			}));
		});

	});

});
