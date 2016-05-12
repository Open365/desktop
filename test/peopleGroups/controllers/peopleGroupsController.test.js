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
	suite('Controller: PeopleGroupsController', function(){
		var scope, peopleGroupsService, eyeosDesktopAuthService, sut,
			$q;

		var expGetMe, expGetUserGroups, expGetUsername, expGetContacts,
			deferredUserGroups, fakeUserGroups,
			deferredAllUsers, fakeAllUsers;

		setup(function() {
			module('peopleGroupsModule');

			inject(function ($injector, $controller, $rootScope, _peopleGroupsService_) {
				scope = $rootScope.$new();
				$q = $injector.get('$q');
				peopleGroupsService = _peopleGroupsService_;
				eyeosDesktopAuthService = $injector.get('eyeosDesktopAuthService');

				deferredUserGroups = $q.defer();
				deferredAllUsers = $q.defer();

				expGetMe = sinon.mock(peopleGroupsService)
					.expects('getMe')
					.once()
					.returns(deferredAllUsers.promise);

				expGetContacts = sinon.mock(peopleGroupsService)
					.expects('getContacts')
					.once()
					.returns(deferredAllUsers.promise);

				expGetUserGroups = sinon.mock(peopleGroupsService)
					.expects('getUserGroups')
					.once()
					.returns(deferredUserGroups.promise);

				expGetUsername = sinon.mock(eyeosDesktopAuthService)
					.expects('getUsername')
					.once()
					.withExactArgs()
					.returns('myCurrentUsername');


				sut = $controller('peopleGroupsController', {
					$scope: scope,
					peopleGroupsService: _peopleGroupsService_,
					eyeosDesktopAuthService: eyeosDesktopAuthService
				});
			});


		});

		suite('init', function () {
			var group1, group2, groupExpectation;
			setup(function () {
				group1 = {
					"groupId": "547885e97cc2a60056bceddc",
					"name": "Els guais",
					"description": "Descripció del grup guais",
					"membersIds": ["perico.palotes", "daniel.asd", "fusti"]
				};

				group2 = {
					"groupId": "547c4649a7e73a8335b97f95",
					"name": "The pets",
					"description": "Descripció del grup the pets",
					"membersIds": ["perico.palotes", "daniel.asd", "hanibal.lecter"]
				};

				fakeUserGroups = [
					group1,
					group2
				];

				fakeAllUsers = {principalId: "myCurrentUsername"};

				sinon.stub(peopleGroupsService, 'applyPermissionsToGroups')
					.returns(fakeUserGroups);
			});

			test('Should call to getMe on peopleGroupsService', function () {
				expGetMe.verify();
			});

			test('Should populate $scope.currentUser with the current user', function () {
				deferredAllUsers.resolve(fakeAllUsers);
				scope.$apply();
				assert.deepEqual(scope.currentUser, fakeAllUsers);
			});

			test('should contain an object with the last group that has received an action', sinon.test(function(){
			    assert.deepEqual({group: {
				    groupId: '',
				    name: '',
				    description: '',
				    members: []
			    }}, scope.current);
			}));

			test('should call eyeosDesktopAuthService.getUsername', function(){
			    assert.equal(scope.currentUserName, 'myCurrentUsername');
				expGetUsername.verify();
			});
		});

		suite('#createGroup', function(){
		    function exercise(group){
			    return scope.createGroup(group);
		    }

			test('should create a group structure', sinon.test(function(){
				var newGroup = {
					groupId: '',
					name: '',
					description: '',
					members: []
				};
				exercise({});
				assert.deepEqual(newGroup, scope.current.group);
			}));

			test('should show the create grup UI', function () {
				var actual = {}, expected = {enableCreateEditGroupWindow: true};
				exercise(actual);
				assert.deepEqual(expected, actual);
			});
		});

		suite('#showEditGroupWindow', function(){
			function exercise(group){
				return scope.showEditGroupWindow(group);
			}

			test('should set enableCreateEditGroupWindow to true', sinon.test(function(){
				var group = {};
				exercise(group);
				assert.isTrue(group.enableCreateEditGroupWindow);
			}));
		});

		suite('#showDeleteDialog', function(){
			var group, confirmDeleteAction;
			setup(function () {
				group = {};
				confirmDeleteAction = function () {}
			});
			function exercise(){
				return scope.showDeleteDialog(group, confirmDeleteAction);
			}

			test('should send an openDeleteGroupDialog event with correct data', sinon.test(function(){
				this.mock(scope)
					.expects('$broadcast')
					.once()
					.withExactArgs('openDeleteGroupDialog', group, confirmDeleteAction);

				exercise();
			}));
		});

		suite('#on currentUserRemovedFromGroup', function(){
			var groupId, group;
			setup(function () {
				groupId = 'anId';
				group = {
					groupId: groupId,
					name: 'asdqwe',
					description: '',
					membersIds: []
				};
			});

			function exercise(){
				scope.$broadcast('currentUserRemovedFromGroup', groupId);
			}

			test('should get the groupModel from peopleGroupsService', sinon.test(function(){
			    this.mock(peopleGroupsService)
				    .expects('getGroupById')
				    .once()
				    .withExactArgs(groupId);

				exercise();
			}));

			test('should call peopleGroupsService.removeGroupFromList with correct group', sinon.test(function(){

				this.stub(peopleGroupsService, 'getGroupById').returns(group);
				this.mock(peopleGroupsService)
					.expects('removeGroupFromList')
					.once()
					.withExactArgs(group);

				exercise();
			}));

			test('should update groups list', sinon.test(function(){
				peopleGroupsService.groups = [];
				scope.userGroups = group;
				exercise();
				assert.equal(scope.userGroups, peopleGroupsService.groups);

			}));
		});
		suite('#getDisplayName', function() {
			var userWithDisplayName, userWithBothNames, userWithFirstName, userWithLastName, userWithNone;
			var expDisplayName, expBothNames, expFirstName, expLastName, expNone;
			setup(function() {
				userWithDisplayName = {
					displayName: "DisplayName",
					firstName: "FirstName",
					lastName: "LastName",
					principalId: "_userWithDisplayName"
				};
				userWithBothNames = {
					firstName: "FirstName",
					lastName: "LastName",
					principalId: "_userWithBothNames"
				};
				userWithFirstName = {
					firstName: "FirstName",
					principalId: "_userWithFirstName"
				};
				userWithLastName = {
					lastName: "LastName",
					principalId: "_userWithLastName"
				};
				userWithNone = {
					principalId: "_userWithNothing"
				};
				expDisplayName = "DisplayName";
				expBothNames = "FirstName LastName";
				expFirstName = "_userWithFirstName";
				expLastName = "_userWithLastName";
				expNone = "_userWithNothing";

			});
			test('if user has a displayName, should return it', function() {
				var result = scope.getDisplayName(userWithDisplayName);
				assert.equal(result, expDisplayName);
			});
			test('should build a displayName if user has a firstName and a lastName', function() {
				var result = scope.getDisplayName(userWithBothNames);
				assert.equal(result, expBothNames);
			});
			test('if user only has a firstName, should return the principalId', function() {
				var result = scope.getDisplayName(userWithFirstName);
				assert.equal(result, expFirstName);
			});
			test('if user only has a lastName, should return the principalId', function() {
				var result = scope.getDisplayName(userWithLastName);
				assert.equal(result, expLastName);
			});
			test('if user has no other info than the principalId, it should return the principalId', function() {
				var result = scope.getDisplayName(userWithNone);
				assert.equal(result, expNone);
			});

		});
	});
});


