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
	'print/eyeosPrintHandler',
	'eyeosSchemes'
], function (DesktopBus, EyeosPrintHandler, eyeosSchemes) {
	return function ($rootScope, $http, settings) {
		var subscriptions = [];

		$rootScope.$destroy(function () {
			$rootScope.unsubscribe();
		});

		$rootScope.unsubscribe = function () {
			subscriptions.forEach(function (sub) {
				sub.unsubscribe();
			});
		};

		subscriptions.push(DesktopBus.subscribe('printFile', function (data) {
			var resolver = eyeosSchemes.getResolver('cdn', null),
				eyeosPrintHandler = new EyeosPrintHandler(null, $http, settings);
			var path = resolver.getPath(data.path, eyeosAuthClient.getUsername());
			$http.get(encodeURI(path), {cache: true})
				.then(eyeosPrintHandler.printMe.bind(eyeosPrintHandler));
		}));
	};
});
