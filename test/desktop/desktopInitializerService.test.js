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
	'desktop/desktopInitializerService'
], function(DesktopInitializer) {
	suite('Service: desktopInitializer', function () {
		var sut;
		var desktopAuthService,
			desktopBusService,
			suspensionDetector;
		var settings;

		setup(function () {
			settings = {
				ENVIRONMENT: 'release'
			};
			desktopAuthService = {
				checkCard: function () {
				}
			};

			desktopBusService = {
				connectToBus: function () {
				}
			};

			suspensionDetector = {
				start: function () {},
				addOnAwakeAction: function () {}
			};

			sut = new DesktopInitializer(desktopAuthService, desktopBusService, suspensionDetector);
		});

		function expect_desktopBusService_connectToBus_called (sinon, times) {
			sinon.mock(desktopBusService)
				.expects('connectToBus')
				.exactly(times)
				.withExactArgs();
		}

		suite('#setAuthClientLoaded', function () {

			setup(function () {
			});

			function exercise () {
				sut.setAuthClientLoaded(settings);
			}

			test('calls desktopAuthService.checkCard', sinon.test(function () {
				this.mock(desktopAuthService)
					.expects('checkCard')
					.once()
					.withExactArgs(sinon.match.func);
				exercise();
			}));

			suite('when checkCard callback is executed', function () {

				test('should call desktopBusService.connectToBus', sinon.test(function () {
					var checkCardStub = sinon.stub(desktopAuthService, 'checkCard');
					expect_desktopBusService_connectToBus_called(this, 1);
					checkCardStub.callsArgWith(0);
					exercise();
				}));

			});
		});


	});

});
