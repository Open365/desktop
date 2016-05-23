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

"use strict";
define(['settings'], function(settings) {
	return function ApplicationsController($scope, $interval, Apps, MAX_APPS_DISPLAYED, eyeosTranslation) {
		var scrollApps;

		$scope.appsList = [];
		$scope.shouldGroupDesktopIcons = settings.SHOULD_GROUP_DESKTOP_ICONS;

		$scope.fistDisplayedApp = 0;
		$scope.lastDisplayedApp = MAX_APPS_DISPLAYED;

		Apps.getAllApplications().then(function(result) {

			var acceptedExtensions = result.reduce(function (prev, curr) {
					return prev.concat(curr.settings.fileExtensions || []);
			}, []);

			localStorage.vdiFileExtensions = JSON.stringify(acceptedExtensions);

			$scope.appsList = result;
			$scope.apps = result.slice($scope.fistDisplayedApp, $scope.lastDisplayedApp);

			//split apps in groups 5 by 5
			var appsLen = result.length;
			$scope.appGroups = [];
			var count = 0;
			var index = 0;
			for(var i=0;i<appsLen;i++) {
				//TODO: check visibility icons
				if(count === 0) {
					$scope.appGroups.push([]);
				}

				if(result[i].showInDesktop) {
					$scope.appGroups[index].push(result[i]);				

					count++;
					if(count === 5) {
						count = 0;
						index++;
					}
				}

				if (settings.LOCALIZATION_DOWNLOAD_CLIENT_ACTIVE) {
					if (result[i].url === settings.URL_DOWNLOAD_CLIENT) {
						result[i].url = $scope.getUrlDownloadClient();
					}
				}
			}
		});

		$scope.scrollDown = function () {
			scrollApps = $interval($scope.showMoreApps, 200);
		};

		$scope.scrollUp = function () {
			scrollApps = $interval($scope.showLessApps, 200);
		};

		$scope.stopScroll = function () {
			$interval.cancel(scrollApps);
		};


		$scope.showMoreApps = function () {
			if($scope.fistDisplayedApp < $scope.appsList.length - MAX_APPS_DISPLAYED) {
				$scope.fistDisplayedApp ++;
				$scope.lastDisplayedApp ++;
				$scope.apps = $scope.appsList.slice($scope.fistDisplayedApp, $scope.lastDisplayedApp);
			}
		};

		$scope.showLessApps = function () {
			if($scope.fistDisplayedApp > 0) {
				$scope.fistDisplayedApp --;
				$scope.lastDisplayedApp --;
				$scope.apps = $scope.appsList.slice($scope.fistDisplayedApp, $scope.lastDisplayedApp);
			}
		};

		$scope.getUrlDownloadClient = function () {
			var url = settings.URL_DOWNLOAD_CLIENT;
			var userLanguage = eyeosTranslation.getUserLanguage();
			if (userLanguage === 'es') {
				var slashLast = url.lastIndexOf('/');
				var pathname = url.substr(slashLast);
				var host = url.substr(0, slashLast + 1);
				url = host + userLanguage + pathname;
			}
			return url;
		}
	};
});

