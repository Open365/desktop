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
		'utils/desktopBus'
	],
	function (DesktopBus) {

		function LogoutHandlerFactory($translate, $window,  SETTINGS, $location) {
			var subscriptions = [];
			var LogoutHandler = {

	            _setLocationTo: function ($window, location) {
	                return function() {
	                    $window.location.href = location;
	                };
	            },

				performLogout: function (eyeosAuthClient, injectedSettings, $window, $ajax) {
					eyeosAuthClient = eyeosAuthClient || window.eyeosAuthClient;
					SETTINGS = injectedSettings || SETTINGS;
					$window = $window || window;
					var self = this;
					function performLogout() {
						var authCard = eyeosAuthClient.getHeaders();
						var headers = {
							'content-type': 'application/json'
							, 'card': JSON.stringify(authCard.card)
							, 'signature': authCard.signature
						};
						var now = new Date().getTime();

						window.eyeosIgnoreConfirmation = true;
						eyeosAuthClient.removeCard();

						// post logout request to backend. fire-and-forget request.
						$ajax = $ajax || $.ajax;

						$.get('/sync/accounts/logout/');

						$ajax({
							url: '/relay/presence/v1/routingKey/logout/userEvent/logout',
							type: 'POST',
							data: {timestamp: now},
							headers: headers,
							success: self._setLocationTo($window, SETTINGS.LOGIN_URL + location.search),
							error: self._setLocationTo($window, SETTINGS.LOGIN_URL + location.search)
						});
					}
					performLogout();

				},

				clearBusSubscriptions: function () {
					subscriptions.forEach(function (sub) {
						sub.unsubscribe();
					});
				}
			};

			subscriptions.push(DesktopBus.subscribe('push.logout', function (data) {
				var transactionId = data.transactionId;

				if($location.search()['TID'] !== transactionId) { //I'm not this TID
					LogoutHandler.performLogout(false, false, false, false);
				}
			}));

			return LogoutHandler;
		}

	return LogoutHandlerFactory;

});
