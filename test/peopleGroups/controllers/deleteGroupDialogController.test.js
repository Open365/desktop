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
	suite('Controller: GroupController', function(){
		var scope, peopleGroupsService, sut, applicationsService,
			$q;

		var deferredDeleteGroup;

		setup(function() {
			module('peopleGroupsModule');

			inject(function ($injector, $controller, $rootScope, _peopleGroupsService_) {
				scope = $rootScope.$new();
				$q = $injector.get('$q');

				deferredDeleteGroup = $q.defer();

				scope.group = {
					groupId: 'aGroupId_123',
					name: 'aGroupName_123',
					membersIds: ['aMember', 'aMember2', 'aMember3']
				};

				sut = $controller('deleteGroupDialogController', {
					$scope: scope
				});
			});


		});

		suite('openDeleteGroupDialog event', function(){
			var fakeConfirmDeleteAction;
			setup(function () {
				fakeConfirmDeleteAction = function () {}
			});

			function exercise () {
				scope.$broadcast('openDeleteGroupDialog', scope.group, fakeConfirmDeleteAction)
			}

		    test('should assign confirmDeleteAction to scope', sinon.test(function(){
		        exercise();
			    assert.equal(scope.confirmDeleteAction, fakeConfirmDeleteAction);
		    }));

			test('should open dialog window', sinon.test(function(){
			    this.mock(scope)
				    .expects('openDialog')
				    .once();

				exercise();
			}));
		});

		suite('#confirmDeleteGroup', function () {

			function exercise () {
				scope.confirmDeleteGroup();
			}

			test('should hide confirm menu', sinon.test(function(){
			    exercise();
				assert.isFalse(scope.showConfirmDelete);
			}));

			test('should call confirmDeleteAction', sinon.test(function(){
			    this.mock(scope)
				    .expects('confirmDeleteAction')
				    .once()
				    .withExactArgs();

				exercise();
			}));
		});

		suite('#openDialog', function(){

			function exercise () {
				return scope.openDialog();
			}

		    test('should show confirm modal', sinon.test(function(){
		        exercise();
			    assert.isTrue(scope.showConfirmDelete)
		    }));
		});

		suite('#cancelDeleteGroup', function(){

			function exercise () {
				return scope.cancelDeleteGroup();
			}

		    test('should hide confirm modal', sinon.test(function(){
			    scope.showConfirmDelete = true;
		        exercise();
			    assert.isFalse(scope.showConfirmDelete)
		    }));
		});



	});
});


