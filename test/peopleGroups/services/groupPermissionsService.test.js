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

suite('Service: GroupPermissionsService', function(){
	var sut, localstorageStub;

	setup(function() {
		module('peopleGroupsModule');

		inject(function($injector, $httpBackend, _groupPermissionsService_) {
			localstorageStub = sinon.stub(localStorage, "getItem").returns(JSON.stringify({
				permissions: ["EYEOS.GROUPS.FOO.BAR"]
			}));
			sut = _groupPermissionsService_;
		});

	});

	teardown(function() {
		localstorageStub.restore();
	});

	suite('#getAllGroupsPermissions', function(){

		function exercise () {
			return sut.getAllGroupsPermissions();
		}

		test('returns the permissions in a key-value mode', sinon.test(function(){
			var result = exercise();
			assert.deepEqual({'FOO':'BAR'}, result);
		}));
	});

});

