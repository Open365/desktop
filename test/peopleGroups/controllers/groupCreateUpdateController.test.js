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
],
	function() {
	suite('Controller: GroupCreateUpdateController', function(){
		var scope, peopleGroupsService, sut,
			$q;

		var expDeleteGroup,
			deferredDeleteGroup;
		var toRestore;
		var $translateStub;
		var translatedMessage;

		setup(function() {
			module('peopleGroupsModule');
			translatedMessage = "a translated message";
			$translateStub = sinon.stub().returns({
				then: function (f) {
					f(translatedMessage);
				}
			});

			inject(function ($injector, $controller, $rootScope, _peopleGroupsService_) {
				scope = $rootScope.$new();
				$q = $injector.get('$q');

				peopleGroupsService = _peopleGroupsService_;

				deferredDeleteGroup = $q.defer();

				scope.group = {
					id: 'aGroupId_123',
					name: 'aGroupName_123',
					members: [{principalId:'aMember'}, {principalId:'aMember2'}, {principalId:'aMember3'}, {principalId:'currentUserName'}]
				};

				scope.current = {
					group: {}
				};

				scope.membersToAdd = [];
				scope.membersToRemove = [];

				expDeleteGroup = sinon.mock(peopleGroupsService)
					.expects('deleteGroup')
					.once()
					.withExactArgs(scope.group)
					.returns(deferredDeleteGroup.promise);

				sut = $controller('groupCreateUpdateController', {
					$scope: scope,
					peopleGroupsService: _peopleGroupsService_,
					$translate: $translateStub
				});
			});
			toRestore = [];
		});

		teardown(function () {
			toRestore.forEach(function (item) {
				item.restore();
			});
		});

		suite('#initGroupsModel', function(){
			setup(function () {
				scope.currentUser = {principalId: 'currentUserName'};

				scope.current.group = {
					id: 'aGroupId_123',
					name: 'aGroupName_123',
					members: [{principalId:'aMember'}, {principalId:'aMember2'}, {principalId:'aMember3'}, {principalId:'currentUserName'}]
				};
				scope.group.members = [{principalId:'aMember'}, {principalId:'aMember2'}, {principalId:'aMember3'}, {principalId:'currentUserName'}];
			});

			function exercise() {
				scope.initGroupsModel(scope.current.group);
			}

			test('when edited an existing user should not add myself again.', sinon.test(function(){
				var beforeModifyCount = scope.group.members.length;
				exercise();
				var afterModifyCount = scope.group.members.length;
				assert.equal(afterModifyCount, beforeModifyCount);
			}));

			test('should initialize showOnlyMembers to false', sinon.test(function(){
			    scope.showOnlyMembers = true;
				exercise();
				assert.isFalse(scope.showOnlyMembers)
			}));
		});

        suite('#showCreateEditGroupWindow.createMode listener', function(){
            setup(function(){
                scope.disableGroupNameEdition = true;
                scope.disableGroupDescriptionEdition = true;
				scope.currentUser = {principalId: 'currentUserName'};

			});

            function exercise(){
                scope.$broadcast('showCreateEditGroupWindow.createMode', scope.group);
            }

            test('should call initGroupsModel', function(){

				var initGroupsModelSpy = sinon.spy(scope, 'initGroupsModel');

                exercise();

                assert(initGroupsModelSpy.calledOnce);

                initGroupsModelSpy.restore();
            });

            test('should set disableGroupNameEdition correctly', function(){
                exercise();

                assert.isFalse(scope.disableGroupNameEdition);
            });

            test('should set disableGroupDescriptionEdition correctly', function(){
                exercise();

                assert.isFalse(scope.disableGroupDescriptionEdition);
            });
        });

        suite('#showCreateEditGroupWindow.updateMode listener', function(){
            setup(function(){
                scope.disableGroupNameEdition = true;
                scope.disableGroupDescriptionEdition = true;
				scope.currentUser = {principalId: 'currentUserName'};

			});

            test('should call initGroupsModel', function(){
                var initGroupsModelSpy = sinon.spy(scope, 'initGroupsModel');

                exercise();

                assert(initGroupsModelSpy.calledOnce);

                initGroupsModelSpy.restore();
            });

            function exercise(){
                scope.$broadcast('showCreateEditGroupWindow.updateMode', scope.group);

			}

            test('should set disableGroupNameEdition correctly', function(){
                exercise();

                assert.isTrue(scope.disableGroupNameEdition);
            });

            test('should set disableGroupDescriptionEdition correctly', function(){
                exercise();

                assert.isFalse(scope.disableGroupDescriptionEdition);
            });
        });


		suite('#getMembersCount', function () {

			function exercise() {
				return scope.getMembersCount();
			}

			test('when no group exists should return 0', sinon.test(function () {
				delete scope.group;
				var membersCount = exercise();
				assert.equal(membersCount, 0);
			}));

			test('should return 0 if 0 members', sinon.test(function () {
				scope.group.members = [];
				var membersCount = exercise();
				assert.equal(membersCount, 0);
			}));

			test('should return 0 if no members', sinon.test(function () {
				delete scope.group.members;
				var membersCount = exercise();
				assert.equal(membersCount, 0);
			}));

			test('should return number of members', sinon.test(function () {
				var membersCount = exercise();
				assert.equal(membersCount, 4);
			}));

		});

		suite('#addMember', function(){

			function exercise(userId) {
				return scope.addMember(userId);
			}

			test('should add the userId into the group', sinon.test(function(){
				var newUser = {principal: 'aNewUserId'};
				exercise(newUser);
				assert.include(scope.group.members, newUser);
			}));

			test('should store the added user in a scope var', sinon.test(function(){
				var newUser = {principalId:'aNewMember'};
				exercise(newUser);
				assert.include(scope.membersToAdd, newUser);
			}));

			test('should not add the userId if already exist', sinon.test(function(){
				var repeatedUser = {principalId:'aMember2'};
				var userCount = scope.group.members.length;
				exercise(repeatedUser);
				var afterInsertUserCount = scope.group.members.length;

				assert.equal(afterInsertUserCount, userCount);
			}));

		});

		suite('#removeMember', function(){

			function exercise(userId) {
				return scope.removeMember(userId);
			}

			test('should remove the userId from the group', sinon.test(function(){
				var existingUser = scope.group.members[0];
				exercise(existingUser);
				assert.notInclude(scope.group.members, existingUser);
			}));

			test('should store the removed user in a scope var', sinon.test(function(){
				var existingUser = scope.group.members[0];
				exercise(existingUser);
				assert.include(scope.membersToRemove, existingUser);
			}));

			test('should not remove the userId if not exist', sinon.test(function(){
				var nonExistingUser = {principalId:'notExistingUser'};;
				var userCount = scope.group.members.length;
				exercise(nonExistingUser);
				var afterRemoveUserCount = scope.group.members.length;

				assert.equal(afterRemoveUserCount, userCount);
			}));

		});

		suite('#isMember', function(){

			function exercise(userId) {
				return scope.isMember(userId);
			}

			test('should return false if not exists', sinon.test(function(){
				var newUser = {principalId:'aNewUserId'};
				var ret = exercise(newUser);
				assert.isFalse(ret);
			}));

			test('should return true if exists', sinon.test(function(){
				var existingUser = {principalId:'aMember2'};
				var ret = exercise(existingUser);
				assert.isTrue(ret);
			}));

		});

		suite('#saveGroupWithUsers', function(){

			var deferredCreateGroup, deferredUpdateGroup;

			setup(function () {
				deferredCreateGroup = deferredUpdateGroup = $q.defer();
			});
			function exercise() {
				return scope.saveGroupWithUsers();
			}

			test('when is creating a group should call peopleGroupsService.createGroup', sinon.test(function(){
				delete scope.group.id;
				this.mock(peopleGroupsService)
					.expects('createGroup')
					.once()
					.withExactArgs(scope.group)
					.returns(deferredCreateGroup.promise);

				exercise();
			}));


			test('when is creating a group should never call peopleGroupsService.updateGroup', sinon.test(function(){
				delete scope.group.id;
				this.mock(peopleGroupsService)
					.expects('updateGroup')
					.never();

				exercise();
			}));

			test("when is creating a group and we get an error from service it should display an error message", function(){
				delete scope.group.id;
				sinon.stub(peopleGroupsService, 'createGroup').returns(deferredCreateGroup.promise);
				sinon.stub(scope, 'addMember');
				var returnedError = {
					code: "ERR_WORKGROUP_EXISTS",
					workgroupName: "a group name"
				};

				var mock = sinon.mock(BootstrapDialog);
				toRestore.push(mock);
				mock.expects('show')
					.once()
					.withExactArgs({
						message: translatedMessage,
						buttons: sinon.match.array
					});

				exercise();
				deferredCreateGroup.reject(returnedError);
				scope.$apply();

				mock.verify();
			});

			test('when is editing a group should call peopleGroupsService.updateGroup', sinon.test(function(){
				this.mock(peopleGroupsService)
					.expects('updateGroup')
					.once()
					.withExactArgs(scope.group, scope.membersToAdd, scope.membersToRemove)
					.returns(deferredUpdateGroup.promise);

				exercise();
			}));

			test('when is editing a group should never call peopleGroupsService.createGroup', sinon.test(function(){
				this.mock(peopleGroupsService)
					.expects('createGroup')
					.never();

				exercise();
			}));

		});

	});
});


