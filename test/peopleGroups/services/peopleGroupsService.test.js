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

suite('Service: PeopleGroupsService', function(){
	var httpBackend, $q, membershipService, groupPermissionsService, sut;
	var fakeResponse;
	var APPLICATION_ENDPOINT = '/principalService/v1';
	var groupId, group1, group2, groupsList;

	setup(function() {
		module('peopleGroupsModule');

		inject(function($injector, $httpBackend, _peopleGroupsService_) {
			sut = _peopleGroupsService_;
			httpBackend = $httpBackend;
			$q = $injector.get('$q');
			membershipService = $injector.get('membershipService');
			groupPermissionsService = $injector.get('groupPermissionsService');
		});

		group1 = {
			"id": "547885e97cc2a60056bceddc",
			"name": "Els guais",
			"description": "Descripció del grup guais",
			"membersIds": ["perico.palotes", "daniel.asd", "fusti"]
		};

		group2 = {
			"id": "547c4649a7e73a8335b97f95",
			"name": "The pets",
			"description": "Descripció del grup the pets",
			"membersIds": ["perico.palotes", "daniel.asd", "hanibal.lecter"]
		};

		fakeResponse = [
			group1,
			group2
		];

		groupsList = [group1, group2];
		sut.groups = groupsList;
	});

	teardown(function() {
		httpBackend.verifyNoOutstandingExpectation();
		httpBackend.verifyNoOutstandingRequest();
	});


	suite('#getUserGroups', function(){
		var stubApplyPermissionsToGroups;

		setup(function () {
			stubApplyPermissionsToGroups = sinon.stub(sut, 'applyPermissionsToGroups');
		});

		teardown(function () {
			stubApplyPermissionsToGroups.restore();
		});

		function exercise () {
			httpBackend.whenGET(APPLICATION_ENDPOINT+'/workgroups/me').respond(fakeResponse);
			return sut.getUserGroups();
		}

		test('makes a GET request to the correct url', sinon.test(function () {
			exercise();
			httpBackend.flush();
		}));

		test('returns the response of the GET call', sinon.test(function () {
			var returnedPromise = exercise();
			var result;
			returnedPromise.then(function(response) {
				result = response;
			});
			httpBackend.flush();
			assert.deepEqual(result, fakeResponse);
		}));

		test('stores in groups property the returned usergroups', sinon.test(function(){
			exercise();
			httpBackend.flush();
			assert.deepEqual(sut.groups, fakeResponse);
		}));

		test('when api call is successfull should call to applyPermissionsToGroups', sinon.test(function(){
			stubApplyPermissionsToGroups.restore();

			this.mock(sut)
			    .expects('applyPermissionsToGroups')
			    .once()
			    .withExactArgs();

			exercise();
			httpBackend.flush();
		}));
	});

	suite('#getAllUsers', function(){
		setup(function () {
			fakeResponse = [
				{"userId": "perico.palotes"},
				{"userId": "daniel.asd"},
				{"userId": "hanibal.lecter"},
				{"userId": "fusti"}
			];
		});

		function exercise () {
            var queryParams = '?select=-permissions%20-_id%20-__v%20-mustChangePassword';
			httpBackend.whenGET(APPLICATION_ENDPOINT+'/principals'+queryParams).respond(fakeResponse);
			return sut.getAllUsers();
		}

		test('makes a GET request to the correct url', sinon.test(function () {
			exercise();
			httpBackend.flush();
		}));

		test('returns the response of the GET call', sinon.test(function () {
			var returnedPromise = exercise();
			var result;
			returnedPromise.then(function(response) {
				result = response;
			});
			httpBackend.flush();
			assert.deepEqual(result, fakeResponse);
		}));
	});

	suite('#getUsersFiltered', function () {
		var filter;
		setup(function () {
			fakeResponse = [
				{"userId": "perico.palotes"},
				{"userId": "daniel.asd"},
				{"userId": "hanibal.lecter"},
				{"userId": "fusti"}
			];
			filter = 'fakeFilter';
		});

		function exercise(filter) {
			httpBackend.whenGET(APPLICATION_ENDPOINT + '/principals/contacts/' + filter).respond(fakeResponse);
			return sut.getUsersFiltered(filter);
		}

		test('makes a GET request to the correct url', sinon.test(function () {

			exercise(filter);
			httpBackend.flush();
		}));

		test('returns the response of the GET call', sinon.test(function () {
			var returnedPromise = exercise(filter);
			var result;
			returnedPromise.then(function (response) {
				result = response;
			});
			httpBackend.flush();
			assert.deepEqual(result, fakeResponse);
		}));
	});

	suite('#getContacts', function () {
		setup(function () {
			fakeResponse = [
				{"userId": "perico.palotes"},
				{"userId": "daniel.asd"},
				{"userId": "hanibal.lecter"},
				{"userId": "fusti"}
			];
		});

		function exercise() {
			httpBackend.whenGET(APPLICATION_ENDPOINT + '/principals/me/contacts/').respond(fakeResponse);
			return sut.getContacts();
		}

		test('makes a GET request to the correct url', sinon.test(function () {
			exercise();
			httpBackend.flush();
		}));

		test('returns the response of the GET call', sinon.test(function () {
			var returnedPromise = exercise();
			var result;
			returnedPromise.then(function (response) {
				result = response;
			});
			httpBackend.flush();
			assert.deepEqual(result, fakeResponse);
		}));
	});

	suite('#addContact', function () {
		function exercise() {
			httpBackend.whenPOST(APPLICATION_ENDPOINT + '/principals/me/contacts/').respond();
			httpBackend.whenGET(APPLICATION_ENDPOINT + '/principals/me/contacts/').respond();
			return sut.addContact();
		}

		test('makes a POST request to the correct url', sinon.test(function () {
			exercise();
			httpBackend.flush();
		}));
	});

	suite('#removeGroupFromList', function(){
		function exercise (group) {
			return sut.removeGroupFromList(group);
		}

		test('if success should delete the deleted group from the groups array', sinon.test(function(){
			exercise(group1);
			assert.notInclude(sut.groups, group1);
		}));
	});

	suite('#deleteGroup', function(){
		var fakeResponseData, status;
		setup(function () {

		});
		function exercise (group) {
			httpBackend.whenDELETE(APPLICATION_ENDPOINT+'/workgroups/'+group.id).respond(status, fakeResponseData);
			return sut.deleteGroup(group);
		}

		test('should send a DELETE request to the server with groupId', sinon.test(function(){
		    exercise(group1);
			httpBackend.flush();
		}));

		test('if success should not delete the deleted group from the groups list', sinon.test(function(){
			// Group does get deleted because of the bus event, this call was repeated
			status = 200;
			fakeResponseData = 1;

			this.mock(sut)
				.expects('removeGroupFromList')
				.never();
			exercise(group1);
			httpBackend.flush();
		}));

		test('should return the error from the server in case of error', sinon.test(function(){
			status = 500;
			fakeResponseData = "myError";

			var returnedPromise = exercise(group1);
			var result;
			returnedPromise.catch(function(response) {
				result = response;
				assert.deepEqual(result, fakeResponseData);
			});
			httpBackend.flush();
		}));
	});


	suite('#createGroup', function(){
		var deferred, sutbAddMembersToGroup;
		setup(function () {
			fakeResponse = {
				"name": "qqqq",
				"_id": "547ef8d5a7e73a8335b97f98",
				"__v": 0
			};

			deferred = $q.defer();
			sutbAddMembersToGroup = sinon.stub(membershipService, 'addMembersToGroup')
				.returns(deferred.promise);
		});

		teardown(function () {
			sutbAddMembersToGroup.restore();
		});

		function exercise (group) {
			httpBackend.whenPOST(APPLICATION_ENDPOINT+'/workgroups', {
				name: group.name,
				description: group.description
			})
				.respond(fakeResponse);

			return sut.createGroup(group);
		}

		test('should make a POST with correct data', sinon.test(function(){
			exercise(group1);
			httpBackend.flush();
		}));

		test('when group is created should add the id to the new group', sinon.test(function(){
			var returnedPromise = exercise(group1);
			returnedPromise.then(function() {
				assert.deepEqual(group1.id, fakeResponse._id);
			});
			httpBackend.flush();
		}));

		test.skip('when group is created should call add the members to group', sinon.test(function(){
			var createdGroup = angular.copy(group1);
			createdGroup.id = fakeResponse._id;

			sutbAddMembersToGroup.restore();
			this.mock(membershipService)
				.expects('addMembersToGroup')
				.once()
				.withExactArgs(createdGroup, group1.membersIds)
				.returns(deferred.promise);

			exercise(group1);
			httpBackend.flush();
		}));


		test.skip('when created should store the new group inside groups array', sinon.test(function(){
			sut.groups = [];
			var createdGroup = angular.copy(group1);
			createdGroup.id = fakeResponse._id;

			var returnedPromise = exercise(group1);
			returnedPromise.then(function() {
				assert.include(sut.groups, createdGroup);
			});

			httpBackend.flush();
			deferred.resolve(createdGroup);
		}));
	});


	suite('#updateGroup', function(){
		var membersToAdd, membersToRemove,
			deferredUpdateMembers, sutbUpdateMembersFromGroup;

		setup(function () {
			deferredUpdateMembers = $q.defer();
			sutbUpdateMembersFromGroup = sinon.stub(membershipService, 'updateMembersFromGroup')
				.returns(deferredUpdateMembers.promise);

			membersToAdd = ['memberAdd1', 'memberAdd2'];
			membersToRemove = ['memberRemove1'];
		});

		function exercise (group) {
			httpBackend.whenPUT(APPLICATION_ENDPOINT+'/workgroups/'+group.id, {
				name: group.name,
				description: group.description
			})
				.respond(fakeResponse);

			return sut.updateGroup(group, membersToAdd, membersToRemove);
		}

		test('should make a PUT with correct data', sinon.test(function(){
			exercise(group1);
			httpBackend.flush();
		}));

		test('when updated the group should call membershipService.updateMembersFromGroup with correct params ', sinon.test(function(){
			sutbUpdateMembersFromGroup.restore();

			this.mock(membershipService)
				.expects('updateMembersFromGroup')
				.once()
				.withExactArgs(group1, membersToAdd, membersToRemove)
				.returns(deferredUpdateMembers.promise);

			exercise(group1, membersToAdd, membersToRemove);
			httpBackend.flush();
		}));

		test('when updated the group and the members should modify the cached group with correct data', sinon.test(function(){
			var modifiedGroup = angular.copy(group1);
			modifiedGroup.description = 'modifiedDescription';

			exercise(modifiedGroup, membersToAdd, membersToRemove);

			deferredUpdateMembers.resolve();
			httpBackend.flush();
			assert.include(sut.groups, modifiedGroup);
		}));

	});


	suite('#getGroupById', function(){
		function exercise (group) {
			return sut.getGroupById(group);
		}

		test('returns a group from the list if exists', sinon.test(function(){
			var returnedGroup = exercise(group1.id);
			assert.equal(returnedGroup, sut.groups[0]);
		}));

		test('returns null if the group does not exists', sinon.test(function(){
			var returnedGroup = exercise('nonExistingId');
			assert.equal(returnedGroup, null);
		}));
	});

	suite('#applyPermissionsToGroups', function () {
		var permissions;

		setup(function () {
			sut.groups = [group1, group2];
			permissions = {};
			permissions[group1.id] = 'administrator';
		});

		function exercise (permissions) {
			return sut.applyPermissionsToGroups(permissions);
		}

		test('when no permissions passed should get permissions from all groups', sinon.test(function(){
		    this.mock(groupPermissionsService)
			    .expects('getAllGroupsPermissions')
			    .once()
			    .returns(permissions);

			exercise();
		}));
		test('returns the stored groups with the admin permission', function () {
			var result = exercise(permissions);
			assert.equal(result[0].admin, true);
			assert.equal(result[1].admin, false);
		});
	});


});

