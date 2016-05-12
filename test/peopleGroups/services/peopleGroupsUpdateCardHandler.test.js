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

suite('PeopleGroupsUpdateCardHandler', function(){
	var sut;

	setup(function() {
		module('peopleGroupsModule');

		inject(function($injector) {
			sut = $injector.get('peopleGroupsUpdateCardHandler');
		});

	});

	teardown(function() {
	});


	suite('#addHandler', function(){

		setup(function () {
			sut.queueActions = [];
		});
		function exercise (groupId, handler, callback) {
			return sut.addHandler(groupId, handler, callback);
		}

		test('when called if no queues initialized for that group, should initialize the queue', sinon.test(function(){
		    exercise('aUnexistentId', 'aHandler');
			assert.isArray(sut.queueActions['aUnexistentId']);
		}));

		test('when called add the passed handler to the correct queue', sinon.test(function(){
		    exercise('aUnexistentId', 'aHandler');
			assert.equal(sut.queueActions['aUnexistentId'][0].handler, 'aHandler');
		}));

	});

	suite('#clearByGroupId', function(){

		function exercise (groupId) {
			return sut.clearByGroupId(groupId);
		}

		setup(function () {
			sut.queueActions['id_1'] = [];
			sut.queueActions['id_1'].push(function(){});
			sut.queueActions['id_1'].push(function(){});
			sut.queueActions['id_1'].push(function(){});
		});

		test('when called should remove the correct queue', sinon.test(function(){
		    exercise('id_1');
			assert.equal(sut.queueActions['id_1'].length, 0);
		}));

		test('when called with not declared queue should not do anything', sinon.test(function(){
		    exercise('id_NOT_CREATED');
			assert.equal(sut.queueActions['id_NOT_CREATED'].length, 0);
		}));

	});

	suite('#execute', function(){
		var action1, action2, action3;

		function exercise (groupId) {
			return sut.execute(groupId);
		}

		setup(function () {
			action1 = {
				"handler": function(){},
				"successCallback": function(){}
			};
			action2 = {
				"handler": function(){},
				"successCallback": function(){}
			};
			action3 = {
				"handler": function(){},
				"successCallback": function(){}
			};
			sut.queueActions['id_1'] = [];
			sut.queueActions['id_1'].push(action1);
			sut.queueActions['id_1'].push(action2);
			sut.queueActions['id_1'].push(action3);
		});

		test('when called and executed should clear all pending actions for that queue', sinon.test(function(){
		    this.mock(sut)
			    .expects('clearByGroupId')
			    .once()
			    .withExactArgs('id_1');

			exercise('id_1', function(){});
		}));

		test('when action result is not a promise should call to successCallback directly', sinon.test(function(){
		    var actionResult = function () {};
			this.stub(action1, 'handler').returns(actionResult);
			this.mock(action1)
				.expects('successCallback')
				.once();

			exercise('id_1');
		}));

	});


	

});

