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
	'appModule'
], function () {
	angular.module('eyeDesktopApp')
		.directive('onResize', ['$window', function ($window) {
			return {
				restrict: 'A',
				scope: {
					onResize: '='
				},
				link: function postLink(scope, element) {

					var wnd = angular.element($window);
					wnd.on('resize', function () {
						scope.onResize(element.width(), element.height());
					});

					// This should be on its own directive
					element.on('scroll', function (e) {
						this.scrollTop = 0;
						this.scrollLeft = 0;
					});
				}
			};
	}]);
});
