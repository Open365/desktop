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
		'auth/eyeosDesktopAuthResultHandlerService',
		'utils/desktopBus',
		'settings'
	],
	function (eyeosDesktopAuthResultHandlerService, DesktopBus) {
		angular.module('eyeosDesktopAuth')
			.service('eyeosDesktopAuthService', ['authResultHandlerService', '$rootScope', 'SETTINGS', '$q',
				function (authResultHandlerService, $rootScope, SETTINGS, $q) {
					var subscriptions = [];

					$rootScope.$destroy(function () {
						$rootScope.unsubscribe();
					});

					$rootScope.unsubscribe = function () {
						subscriptions.forEach(function (sub) {
							sub.unsubscribe();
						});
					};

					subscriptions.push(DesktopBus.subscribe('push.newCardAvailable', function () {
						eyeosAuthClient.doRenew();
					}));

					subscriptions.push(DesktopBus.subscribe('cardRenewed', function (credentials) {
						// event fired after card was renewed. update headers and Angular-emit to push.renewCard
						authResultHandlerService.setNewHeaders();
						$rootScope.$emit('push.renewCard', credentials);
					}));

					subscriptions.push(DesktopBus.subscribe('push.doRenewCard', function () {
						// does REST req against backend to get new card, cardRenewed event is fired
						eyeosAuthClient.doRenew();
					}));

					var promise, deferred;
					return {
						forceCheckCard: function (successCb, errorCb) {
							promise = null;
							this.checkCard(successCb, errorCb);
						},

						checkCard: function (successCb, errorCb) {
							successCb = successCb || function () {};
							errorCb = errorCb || function () {};

							if (promise) {
								promise.then(successCb, errorCb);
								return promise;
							}
							deferred = $q.defer();
							if (typeof(eyeosAuthClient) !== "undefined") {
								eyeosAuthClient.checkCard(function () {
									authResultHandlerService.setNewHeaders();
									successCb();
									return deferred.resolve();
								}, function() {
									if(SETTINGS.ENVIRONMENT === 'develop') {
										return deferred.resolve();
									} else {
										errorCb();
										authResultHandlerService.error();
										return deferred.reject('check card failed');
									}
								});
							} else {
								console.error('eyeosDesktopAuthService: eyeosAuthClient lib not loaded');
								errorCb();
								authResultHandlerService.error();
								return deferred.reject('eyeosDesktopAuthService: eyeosAuthClient lib not loaded');
							}

							promise = deferred.promise;
							return promise;
						},

						getUsername: function () {
							return eyeosAuthClient.getUsername();
						}

					};
				}]);
	});

