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
	'utils/serviceProvider'
], function (serviceProvider) {

	function LocationWrapper ($location, $route, $rootScope) {
		this.$location = $location || serviceProvider.get('$location');
		this.$route = $route || serviceProvider.get('$route');
		this.$rootScope = $rootScope || serviceProvider.get('$rootScope');
	}

	LocationWrapper.prototype.searchWithoutReloading = function(search, paramValue, config) {
		var self = this,
			unbind = this.$rootScope.$on('$locationChangeSuccess', function () {
				self.$route.routes[config.url].reloadOnSearch = true;
				unbind();
			});
		this.$route.routes[config.url].reloadOnSearch = false;
		this.$location.search(search, paramValue);
	};

	return LocationWrapper;
});
