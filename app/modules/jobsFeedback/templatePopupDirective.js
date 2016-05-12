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
	'windows/windowInfo/windowInfoFactory'
], function (WindowInfoFactory) {

	function templatePopupDirective (wmFactory, $compile) {
		return {
			compile: function (element, attrs) {
				return function ($scope) {
					var windowInfoFactory = new WindowInfoFactory();
					var appInfo = windowInfoFactory.getFeedbackInfo($scope, $scope.feedbackHook);
					var appData = appInfo.getInfo();
					appData.notifyWindowReady = function (win) {
						window.feedbackPopupWindow = win;
						var shouldNotifyClose = true;

						var cancelCloseEvent = function () {
							shouldNotifyClose = false;
						};

						var close = function () {
							if (shouldNotifyClose) {
								$scope.$emit("feedbackWindowClosed");
							}

							shouldNotifyClose = true;

							win.signals.off('closeDone', close);
							win.signals.off('detach', cancelCloseEvent);
							win.signals.off('reattach', cancelCloseEvent);
						};

						win.signals.on('closeDone', close);

						win.signals.on('detach', cancelCloseEvent);
						win.signals.on('reattach', cancelCloseEvent);
					};
					$scope.$emit('openApp', appData);
				};
			}
		};
	}

	return templatePopupDirective;
});
