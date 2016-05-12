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
	'bus/eyeosDesktopBusModule'
], function() {
	angular.module('eyeosDesktopBus')
		.service('eyeosDesktopBusService', ['SETTINGS' ,function (SETTINGS) {
			return {
				connectToBus: function () {
					//get the card or use anonymous...
					var card;

					if(SETTINGS.ENVIRONMENT === 'develop') {
						card = {username: 'anonymous'};
						console.warn('DEVELOP MODE: Connected as ANONYMOUS user to stomp queue');
					} else {
						//get the card using auth library?
						card = JSON.parse(localStorage.getItem('card'));
					}

					window.eyeosBusClient.start(card, 'signature', function(rawData) {
						if(rawData) {
							var data = JSON.parse(rawData);
							window.DesktopBus.dispatch('push.'+data.type, data.data);
						}

					}, function() {
						window.DesktopBus.dispatch("eyeosBusReady");
					});
				}
			}
		}]
	);
});
