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

		var expDeleteGroup,
			deferredDeleteGroup,
			expScopeEmit;

		setup(function() {
			module('peopleGroupsModule');

			inject(function ($injector, $controller, $rootScope, _peopleGroupsService_) {
				scope = $rootScope.$new();
				$q = $injector.get('$q');
				applicationsService = $injector.get('ApplicationsService');
				peopleGroupsService = _peopleGroupsService_;

				deferredDeleteGroup = $q.defer();

				scope.group = {
					groupId: 'aGroupId_123',
					name: 'aGroupName_123',
					members: [{principalId:'aMember'}, {principalId:'aMember2'}, {principalId:'aMember3'}]
				};

				scope.current = {
					group: {}
				};

				scope.showEditGroupWindow = function () {};
				scope.showDeleteDialog = function () {};

				expDeleteGroup = sinon.mock(peopleGroupsService)
					.expects('deleteGroup')
					.once()
					.withExactArgs(scope.group)
					.returns(deferredDeleteGroup.promise);


				applicationsService._apps = [
					{
						"bigIcon": "fakeIcon",
						"smallIcon": "fakeIcon",
						"name": "Foo",
						"tooltip": "Foo",
						"description": "foo application",
						"url": "/appfoo",
						"settings": {
							"minSize": {
								"width": 600,
								"height": 340
							}
						}
					}, {
						"bigIcon": "/eyeosfiles/images/icons/64x64/apps/files.png",
						"smallIcon": "/eyeosfiles/images/icons/16x16/apps/files.png",
						"name": "Files",
						"tooltip": "Files",
						"description": "filesystem application",
						"url": "/eyeosfiles",
						"settings": {
							"minSize": {
								"width": 600,
								"height": 340
							}
						}
					}
				];

				sut = $controller('groupController', {
					$scope: scope,
					peopleGroupsService: _peopleGroupsService_,
					applicationsService: applicationsService
				});
			});


		});

		suite('#confirmDeleteGroup', function () {

			function exercise () {
				scope.confirmDeleteGroup();
			}

			test('Should call to deleteGroup on peopleGroupsService', function () {
				exercise();
				expDeleteGroup.verify();
			});

			test('should hide confirm menu', sinon.test(function(){
			    exercise();
				assert.isFalse(scope.showConfirmDelete);
			}));
		});

		suite('#deleteGroup', function(){

			function exercise () {
				return scope.deleteGroup();
			}

		    test('should show confirm modal', sinon.test(function(){
		        exercise();
			    assert.isTrue(scope.showConfirmDelete)
		    }));

			test('should set clicked group as current group', sinon.test(function(){
			    exercise();
				assert.deepEqual(scope.group, scope.current.group);
			}));

			test('should call to parent showDeleteDialog', sinon.test(function(){
			    this.mock(scope)
				    .expects('showDeleteDialog')
				    .once()
				    .withExactArgs(scope.group, scope.confirmDeleteGroup);

				exercise();
			}));
		});

		suite('#openFiles', function () {
			var appExp;

			setup(function () {
				appExp = {
					"bigIcon": "/eyeosfiles/images/icons/64x64/apps/files.png",
					"smallIcon": "/eyeosfiles/images/icons/16x16/apps/files.png",
					"name": "Files",
					"tooltip": "Files",
					"description": "filesystem application",
					"url": "/eyeosfiles?path=workgroup://" + scope.group.name + "/",
					"settings": {
						"minSize": {
							"width": 600,
							"height": 340
						}
					}
				};
			});
			function exercise() {
				return scope.openFiles();
			}

			test('calls $scope.$emit with the app files with the workgroup path', sinon.test(function () {
				this.mock(scope)
					.expects('$emit')
					.once()
					.withExactArgs('openApp', appExp);

				exercise();
			}));
		});

		suite('#editGroup', function(){

			function exercise () {
				return scope.editGroup();
			}

			test('should assign the current group', sinon.test(function(){
			    exercise();
				assert.deepEqual(scope.current.group, scope.group);
			}));

			test('should call showEditGroupWindow', sinon.test(function(){
				this.mock(scope)
					.expects('showEditGroupWindow')
					.once();
				exercise();
			}));
		});

		suite('#editGroupInGroup', function(){

			var group;
			setup(function () {
				group = {};
			});

			function exercise (group) {
				return scope.editGroupInGroup(group);
			}

			test('should assign the current group', sinon.test(function(){
			    exercise(group);
				assert.equal(scope.current.group, group);
			}));

			test('should call showEditGroupWindowInGroup', sinon.test(function(){
				this.mock(scope)
					.expects('showEditGroupWindowInGroup')
					.once();
				exercise(group);
			}));
		});


	});
});


