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
	'utils/desktopBus',
	'settings'
], function (DesktopBus, settings) {

	function LoadingListController ($scope, loadingService) {
		$scope.loadingWindows = loadingService.loadings;

		$scope.removeLoading = function () {
			loadingService.removeLoading();
			setTimeout(function(){
				$scope.$apply();
			}, 0);
		};

		$scope.$on('openLoading', function (openLoading, app) {
			loadingService.openLoading($scope.$new(), $scope.hooks.appLoading, app.openType);
			attachTimeoutErrorToLoading();
		});

		function attachTimeoutErrorToLoading () {
			setTimeout(function () {
				loadingService.replaceLastLoadingAppTemplate('vdiConnectionError');
			}, settings.LOADING_TIMEOUT);
		}

		$scope.$on('reopenLoading', function (ev, loadingWindowInfo) {
			loadingService.reopenLoading(loadingWindowInfo);
		});

		var subscriptions = [];

		subscriptions.push(DesktopBus.subscribe('appLoaded', function () {
			loadingService.closeLoading();
			$scope.$apply();
		}));

		$scope.unsubscribe = function () {
			subscriptions.forEach(function (sub) {
				sub.unsubscribe();
			});
		};
	}



	return LoadingListController;
});
