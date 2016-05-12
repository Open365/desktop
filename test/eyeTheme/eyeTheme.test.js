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
define([], function() {
	suite('Module: eyeTheme', function(){
		var sut,
			$filter;

			setup(function() {
				module('eyeTheme');

				inject(function ($injector) {
					$filter = $injector.get('$filter');
				});


			});

		suite('filter: extractNameFromLink', function () {
			var result,
				templateURL;
			setup(function () {
				templateURL = 'addons/hideApps/templates/hideApps.tpl.html';

				sut = $filter('extractNameFromLink');
			});

			test('return addon name', sinon.test(function(){
				result = sut(templateURL);
				assert.equal(result, 'hideapps');
			}));
		});

		suite('filter: filterMultiple', function () {
			var result,
				addon1, addon2, addon3, addon4, addons, filter;
			setup(function () {

				addon1 = 'addons/hideApps/templates/hideApps.tpl.html';

				addon2 = 'addons/latencyMeter/templates/latencyMeter.tpl.html';

				addon3 = 'addons/userInfo/templates/userInfo.tpl.html';

				addon4 = 'addons/applications/templates/applications.tpl.html';

				addons = [ addon1, addon2, addon3, addon4 ];

				filter = ['hideapps','userinfo'];

				sut = $filter('filterMultiple');
			});

			test('return specific addons', sinon.test(function(){
				result = sut( addons, filter );
				assert.deepEqual(result, [ addon1, addon3 ]);
			}));
		});

	});
});


