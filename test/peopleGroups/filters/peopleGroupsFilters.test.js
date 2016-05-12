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
	suite('Controller: PeopleGroupsFilters', function(){
		var sut,
			$filter;

			setup(function() {
				module('peopleGroupsModule');

				inject(function ($injector) {
					$filter = $injector.get('$filter');
				});


			});

		suite('removeMeFromGroupFilter', function () {
			var result,
				eyeosUsers, user1, user2, user3;
			setup(function () {
				user1 = {
					principalId: "perico.palotes"
				};
				user2 = {
					principalId: "daniel.asd"
				};
				user3 = {
					principalId: "hanibal.lecter"
				};
				eyeosUsers = [user1, user2, user3];
				sut = $filter('removeMeFromEyeosUsersList');
			});


			test('return all items except me', sinon.test(function(){
				result = sut(eyeosUsers, "daniel.asd");
				assert.notInclude(result, user2);
			}));

			test('when no members given should return undefined', sinon.test(function(){
				result = sut(null, 'asd');
				assert.isUndefined(result);
			}));
		});

		suite('#groupSearchFilter', function () {
			var result,
				groups, group1, group2;
			setup(function () {

				group1 = {
					name: "name1",
					admin: true,
					description: "description1",
					id: "54883654bc070ae90814110d",
					membersIds: ["perico.palotes", "daniel.asd", "hanibal.lecter"]
				};

				group2 = {
					name: "name2",
					admin: false,
					description: "description2",
					id: "54883654bc070ae34814120z",
					membersIds: ["perico.palotes", "hanibal.lecter"]
				};

				groups = [group1, group2];
				sut = $filter('groupSearchFilter');
			});



			test('return all items containing passed string in name', sinon.test(function(){
				result = sut(groups, "me1");
				assert.deepEqual(result, [group1]);
			}));

			test('return all items containing passed string in description', sinon.test(function(){
				result = sut(groups, "ption2");
				assert.deepEqual(result, [group2]);
			}));

			test('return all items containing passed string in members', sinon.test(function(){
				result = sut(groups, "daniel");
				assert.deepEqual(result, [group1]);
			}));

		});

		suite('#peopleSearchFilter', function () {
			var result,
				eyeosUsers, user1, user2, user3;
			setup(function () {
				user1 = {
					principalId: "perico.palotesasd"
				};
				user2 = {
					principalId: "daniel.asd"
				};
				user3 = {
					principalId: "hanibal.lecter"
				};
				eyeosUsers = [user1, user2, user3];
				sut = $filter('peopleSearchFilter');
			});

			test('when no search text should return all users passed', sinon.test(function(){
				result = sut(eyeosUsers, "");
				assert.equal(result, eyeosUsers);
			}));

			test('return all items containing passed string principalId', sinon.test(function(){
				result = sut(eyeosUsers, "asd");
				assert.deepEqual(result, [user1, user2]);
			}));

		});

		suite('#nonAssignmentFilter', function () {
			var group1, group2, group3, group4, group5;

			setup(function() {
				group1 = {

				};
				group2 = {
					extra_params:{}
				};
				group3 = {
					extra_params: {
						tags: []
					}
				};
				group4 = {
					extra_params: {
						tags: ['foo', 'bar', 'subject', 'buz']
					}
				};
				group5 = {
					extra_params: {
						tags: ['foo', 'bar', 'buz']
					}
				};
				sut = $filter('nonAssignmentFilter');
			});

			test("returns the non subject groups", function () {
				var groups = [group1, group2, group3, group4, group5];
				var expected = [group1, group2, group3, group5];
				var actual = sut(groups);
				assert.deepEqual(expected, actual);
			});

		});


	});
});


