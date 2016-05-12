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

suite('Service: MembershipService', function(){
	var httpBackend, $q, sut;
	var fakeResponse;
	var APPLICATION_ENDPOINT = '/principalService/v1';
	var group, members, dataToSend;

	setup(function() {
		module('peopleGroupsModule');

		inject(function($injector, $httpBackend, _membershipService_) {
			sut = _membershipService_;
			httpBackend = $httpBackend;
			$q = $injector.get('$q');
		});

		group = {
			"groupId": "547885e97cc2a60056bceddc",
			"name": "Els guais",
			"description": "Descripció del grup guais"
		};

		members = [{principalId:"perico.palotes"}, {principalId:"daniel.asd"}, {principalId:"fusti"}];

		dataToSend = [
			{
				"groupId": group.id,
				"memberId": members[0].principalId
			}, {
				"groupId": group.id,
				"memberId": members[1].principalId
			}, {
				"groupId": group.id,
				"memberId": members[2].principalId
			}
		];
		fakeResponse = 'A response';
	});

	teardown(function() {
		httpBackend.verifyNoOutstandingExpectation();
		httpBackend.verifyNoOutstandingRequest();
	});

	suite('#addMembersToGroup', function(){

		function exercise (group, members) {
			httpBackend
				.whenPOST(APPLICATION_ENDPOINT+'/memberships', JSON.stringify(dataToSend))
				.respond(fakeResponse);

			return sut.addMembersToGroup(group, members);
		}

		test('should make a POST with correct data', sinon.test(function(){
			exercise(group, members);
			httpBackend.flush();
		}));
	});

	suite('#removeMembersFromGroup', function(){
		function exercise (group, members) {
			var memberIds = members.map(_.property('principalId'));
			dataToSend = {
				"$and": [
					{ "groupId": group.id},
					{ "memberId": { "$in": memberIds} }
				]
			};

			httpBackend
				.whenDELETE(APPLICATION_ENDPOINT+'/memberships/?conditions='+JSON.stringify(dataToSend))
				.respond(fakeResponse);

			return sut.removeMembersFromGroup(group, members);
		}

		test('should make a POST request with correct data', sinon.test(function(){
			exercise(group, members);
			httpBackend.flush();
		}));
	});

	suite('#updateMembersFromGroup', function(){
		var stubAddMembers, stubRemoveMembers,
			membersToAdd, membersToRemove,
			deferredAdd, deferredRemove,
			addMembersPromise, removeMembersPromise;

		setup(function () {
			addMembersPromise = 'addMembersPromise';
			removeMembersPromise = 'removeMembersPromise';

			stubAddMembers = sinon.stub(sut, 'addMembersToGroup').returns(addMembersPromise);
			stubRemoveMembers = sinon.stub(sut, 'removeMembersFromGroup').returns(removeMembersPromise);

			membersToAdd = ['memberAdd1', 'memberAdd2'];
			membersToRemove = ['memberRemove1'];

			deferredAdd = $q.defer();
			deferredRemove = $q.defer();
		});

		function exercise (group, membersToAdd, membersToRemove) {
			return sut.updateMembersFromGroup(group, membersToAdd, membersToRemove);
		}

		test('should call to addMembersToGroup with correct data', sinon.test(function(){
			stubAddMembers.restore();

			this.mock(sut)
				.expects('addMembersToGroup')
				.once()
				.withExactArgs(group, membersToAdd);

			exercise(group, membersToAdd, membersToRemove);
		}));


		test('should call to removeMembersFromGroup with correct data', sinon.test(function(){
			stubRemoveMembers.restore();

			this.mock(sut)
				.expects('removeMembersFromGroup')
				.once()
				.withExactArgs(group, membersToRemove);

			exercise(group, membersToAdd, membersToRemove);
		}));


		test('should call to $q.all with correct params', sinon.test(function(){
			this.mock($q)
				.expects('all')
				.once()
				.withExactArgs(addMembersPromise, removeMembersPromise);

			exercise(group, membersToAdd, membersToRemove);

		}));

		test('should return a promise', sinon.test(function(){
			this.stub($q, 'all').returns('aPromise');
			var retVal = exercise(group, membersToAdd, membersToRemove);
			assert.equal(retVal, 'aPromise');
		}));
	});

});

