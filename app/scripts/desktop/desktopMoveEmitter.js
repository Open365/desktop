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
	'appModule',
	'windows/newPopupWindow/windowOnMove',
	'utils/desktopBus'
], function (appModule, WindowOnMove, DesktopBus) {
	angular.module('eyeDesktopApp')
		.service('desktopMoveEmitter', ['$window', function ($window) {
			var windowOnMove = new WindowOnMove();
			windowOnMove.setWindow($window);
			windowOnMove.addEventListener('move', notifyDesktopMoved);


			function notifyDesktopMoved(xPos, yPos, moved) {
				if (moved) {
					DesktopBus.dispatch('desktopMoved', {x: xPos, y: yPos, desktopWindow: $window});
				}
			}
		}]);
});
