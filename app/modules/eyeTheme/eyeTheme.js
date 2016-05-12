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
define(['modules/eyeTheme/eyeThemeInfo'],function (eyeThemeInfo) {
	angular.module('eyeTheme', [])
		.controller('ThemeController', ['$scope', '$controller', function ($scope, $controller) {
			$scope.hooks = eyeThemeInfo.getHooks();
			$scope.addons = eyeThemeInfo.getAddonTemplates();

			// Execute the initControllers.
			eyeThemeInfo.getInitControllers().forEach(function(controllerName) {
				$controller(controllerName, {$scope: $scope.$new()});
			});
		}])

		.filter('extractNameFromLink', function(){
			return function(input){
				input = input.toLowerCase();
				input = input.substring(input.lastIndexOf('/')+1);
				input = input.replace('.tpl.html','');
				return input;
			};
		})

		.filter('filterMultiple', function(){
			return function(input, filter) {
			    var filtered = [];
			    for (var i = 0; i < input.length; i++) {
			    	for (var j = 0; j < filter.length; j++) {
			    		var InputLowerCase = input[i].toLowerCase();
			    		var FilterLowerCase = filter[j].toLowerCase();
						if(InputLowerCase.indexOf(FilterLowerCase) > -1){
							filtered.push(input[i]);
						}
					}
			    }
			    return filtered;
		  	};
		});
});
