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
define([], function () {
	function WindowReopener () {

	}

	WindowReopener.prototype.reopenInPopup = function (win, scope, windowTempateType, content) {
		this.reopenByType('detached_application', win, scope, windowTempateType, content);
	};

	WindowReopener.prototype.reopenInVentus = function (win, scope, windowTempateType, content) {
		this.reopenByType('attached_application', win, scope, windowTempateType, content);
	};

	WindowReopener.prototype.reopenByType = function (openType, win, scope, windowTempateType, content) {
		var doOpen = function () {
			scope.$emit('openApp', scope.appData);
		};

		if(scope.appData.type === 'eyeos_vdi_application'){
			doOpen = function () {
				DesktopBus.dispatch('windowCreate', scope.appData);
			};
		}

		scope.appData.openType = openType;

		if (scope.appData.isLoading) {
			scope.$emit('reopenLoading', scope.appData);
		} else {
			scope.onRemove();

			if (windowTempateType === "EyeIframeWindow") {
				scope.appData.url = content[0].contentWindow.location.href;
			}

			doOpen();
		}

		scope.$apply();
		win.close();
	};

	return WindowReopener;
});

