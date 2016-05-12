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
require([
	'bower/postal.js/lib/postal'
], function(Postal) {
	suite('Service: eyeosDesktopAuthService', function(){
		var sut,
			eyeosAuthClientMock,
			authResultHandlerService,
			$rootScope;

		setup(function() {
			module('eyeosDesktopAuth');

			window.postal = Postal;

			inject(function($injector, _eyeosDesktopAuthService_, _authResultHandlerService_) {
				authResultHandlerService = _authResultHandlerService_;
				sut = _eyeosDesktopAuthService_;
				$rootScope = $injector.get('$rootScope');
			});

			eyeosAuthClientMock = sinon.mock(eyeosAuthClient);

		});
		teardown(function () {
			eyeosAuthClientMock.restore();
		});

		suite('checkCard', function(){
			var fakeCallback, fakeErrCallback;
			setup(function () {
				fakeCallback = sinon.spy();
				fakeErrCallback = sinon.spy();
			});

			function exercise() {
				sut.checkCard();
			}

			test('checkCard when eyeosAuthClient does not exist should execute error callback', sinon.test(function(){
				var backupEyeosAuthClient = angular.copy(eyeosAuthClient);
				window.eyeosAuthClient = undefined;
				this.mock(authResultHandlerService)
				    .expects('error')
				    .once();
				exercise();
				window.eyeosAuthClient = backupEyeosAuthClient;
			}));

			test('checkCard when called should call eyeosAuthClient.checkCard with correct args', function () {
				var expGetHeadersCalled = eyeosAuthClientMock.expects('checkCard')
					.once()
					.withArgs(sinon.match.func, sinon.match.func);
				exercise();
				expGetHeadersCalled.verify();
			});

		});


		suite('NewCardAvailable', function(){
			var data;

			setup(function () {
				data = "eventData";
			});

			teardown(function () {
				$rootScope.unsubscribe();
			});

		    function exercise () {
			    DesktopBus.dispatch("push.newCardAvailable", data);
		    }

			test.skip('receiving push.newCardAvailable from postal calls eyeosAuthClient.doRenew', function () {
				eyeosAuthClientMock.expects('doRenew')
					.once();
				exercise();
				eyeosAuthClientMock.verify();
			});

		});


	});
});
