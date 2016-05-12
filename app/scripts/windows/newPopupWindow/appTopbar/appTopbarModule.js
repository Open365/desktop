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
		'windows/newPopupWindow/appTopbar/appTopbarDirective',
		'windows/newPopupWindow/appTopbar/appTopbarController'
	],
	function (appTopbarDirective, appTopbarController) {
		angular.module('appTopbar', ['eyeWindows'])
			.directive('appTopbarDirective', ['$interval', appTopbarDirective])
			.controller('appTopbarController', ['$scope', 'WindowListService', appTopbarController]);
	});
