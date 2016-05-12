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
	'app/appInfo',
	'modules/eyeApplications/eyeApplications'
], function(AppInfo) {
	suite('Service: VdiAppFactory', function(){
		var VdiAppFactory;

		setup(function() {
			module('eyeApplications');

			inject(function($httpBackend, _VdiAppFactory_) {
				VdiAppFactory = _VdiAppFactory_;
			});
		});

		teardown(function () {
		});

		suite('getApp', function(){
			var data, expectedApp;
		    function exercise () {
			    return VdiAppFactory.getApp(data);
		    }
			test('getApp when called should return a correct app data', sinon.test(function(){
				data = {
					url: 'aUrl'
				};
				expectedApp = new AppInfo("VDIApp","", "", "eyeos_vdi_application");
				expectedApp.setUrl("vdi://" + data.url);
				expectedApp.setIsVdi(true);

				var returnedApp = exercise();
				assert.deepEqual(returnedApp, expectedApp);
			}));
		});
	});
});


