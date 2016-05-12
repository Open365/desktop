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
		'startMenu/logoutHandler',
		'bower/postal.js/lib/postal',
		'utils/desktopBus'
	],
	function (LogoutHandler, Postal, DesktopBus) {
		suite('Service: LogoutHandler', function () {
			var sut;
			var SETTINGS;
			var $window;
			var eyeosAuthClient,
				$translate, $location,
				$q, deferred, scope,
				backupEyeosAuthClient;

			setup(function () {
				module('eyeStartMenu');

				window.postal = Postal;
				$translate = function () {
					return deferred.promise;
				};

				inject(function ($injector) {
					$q = $injector.get('$q');
					var $rootScope = $injector.get('$rootScope');
					$location = $injector.get('$location');
					$window = $injector.get('$window');
					var ngSettings = $injector.get('SETTINGS');
					scope = $rootScope.$new();

					sut = new LogoutHandler($translate, $window, ngSettings, $location);
				});

				SETTINGS = {
					LOGIN_URL: 'a fake login url'
				};

				eyeosAuthClient = {
					removeCard: function () {
					},
					getHeaders: function () {
						return {card: 'fakecard', signature: 'fakesig'};
					}
				};
				backupEyeosAuthClient = angular.copy(window.eyeosAuthClient);
				window.eyeosAuthClient = eyeosAuthClient
			});
			teardown(function (){
				window.eyeosAuthClient = backupEyeosAuthClient;
				sut.clearBusSubscriptions();
			});

			suite('#performLogout', function () {
				var ajaxStub,
					fakeWindow;

				setup(function() {
					ajaxStub = sinon.stub($, "ajax");
					fakeWindow = {
						location: {
							href: 'fakelocationhref'
						}
					};
				});
				teardown(function() {
					$.ajax.restore();
				});

				function exercise() {
					sut.performLogout(eyeosAuthClient, SETTINGS, $window, false);
				}

				test("calls eyeosAuthClient.removeCard", sinon.test(function () {
					this.mock(eyeosAuthClient)
						.expects('removeCard')
						.once()
						.withExactArgs();

					exercise();
				}));

				test("calls $ajax with proper POST parameters", sinon.test(function () {
					exercise();

					var headers = eyeosAuthClient.getHeaders();
					headers.card = JSON.stringify(headers.card);


					assert($.ajax.calledWithMatch({
						url: '/relay/presence/v1/routingKey/logout/userEvent/logout',
						type: 'POST',
						headers: headers

					}));
				}));

				test.skip("After calling performLogout after posting succesfully to server current window.location is the Login Url", sinon.test(function () {
					var expected = SETTINGS.LOGIN_URL;

					ajaxStub.yieldsTo('success');
					sut.performLogout(eyeosAuthClient, SETTINGS, fakeWindow, ajaxStub);
					var actual = fakeWindow.location.href;

					assert.equal(actual, expected, 'window location href not set');
				}));

				test.skip("After calling performLogout after posting with error to server current window.location is the Login Url", sinon.test(function () {
					var expected = SETTINGS.LOGIN_URL;

					ajaxStub.yieldsTo('error');
					sut.performLogout(eyeosAuthClient, SETTINGS, fakeWindow, ajaxStub);
					var actual = fakeWindow.location.href;

					assert.equal(actual, expected, 'window location href not set');
				}));
			});

			suite('push logout events', function(){

				suite('when push.logout event received', function(){
					var transactionId;
					setup(function () {
						sinon.stub($, "ajax");
						transactionId = '550e8400-e29b-41d4-a716-446655440000';
					});

					teardown(function(){
						$.ajax.restore();
					});

					function exercise () {
						var message = {transactionId: transactionId};
						DesktopBus.dispatch('push.logout', message);
					}
					test('and it didn\'t start with our own login should perform logout ', function(){
						exercise();

						var headers = eyeosAuthClient.getHeaders();
						headers.card = JSON.stringify(headers.card);

						assert($.ajax.calledWithMatch({
							url: '/relay/presence/v1/routingKey/logout/userEvent/logout',
							type: 'POST',
							headers: headers
						}));
					});

					test('and it started with our own login should not perform logout ', function(){

						$location.search("TID="+transactionId).replace();
						exercise();

						assert.isFalse($.ajax.called, 'Logout performed');
					});
				});
			});

		});
	});
