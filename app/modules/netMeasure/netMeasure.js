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
define(['settings', 'modules/netMeasure/netMeasureService'], function (settings, NetMeasureService) {
	angular.module('netMeasure', [])
		.service('netMesasureService', [function () {
			var netMeasurer = new NetMeasureService(settings);
			window.netMeasurer = netMeasurer;

			window.DesktopBus.subscribe('netMesure.newPingTarget', function (target) {
				netMeasurer.start(target);
			});

			return netMeasurer;
		}])
		.controller('netMeasureController', ['$scope', 'netMesasureService', '$interval', function ($scope, netMesasureService, $interval) {
			var interval;
			netMesasureService.subscribe(function (latency) {
				$interval.cancel(interval);
				$scope.latency = latency;
				setTimeout(function(){
					$scope.$apply();
				}, 0);
			});
			var aux = 0;
			interval = $interval(function () {
				aux++;
				$scope.latency = aux % 6;
			}, 100);
			$scope.latency = 0;
		}]);
});
