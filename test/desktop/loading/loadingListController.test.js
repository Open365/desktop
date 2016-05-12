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

define([
	'desktop/loading/loadingService',
	'bower/postal.js/lib/postal',
	'utils/desktopBus',
	'settings',
	'desktop/desktopController'
], function (LoadingService, Postal, DesktopBus, settings) {

	suite("LoadingListController", function () {
		var sut,
			$scope,
			loadingService;

		setup(function () {
			module('eyeDesktopApp');
			loadingService = new LoadingService();
			window.postal = Postal;

			inject(function ($injector, $controller, $rootScope) {
				$scope = $rootScope.$new();
				sut = $controller('LoadingListController', {
					$scope: $scope,
					LoadingService: loadingService
				});
			});
		});

		teardown(function () {
			$scope.unsubscribe();
		});

		test('on init should contain a loadingWindows array', sinon.test(function(){
		    assert.equal($scope.loadingWindows, loadingService.loadings);
		}));

		function createDummyChildScope() {
			var dummyChildScope = {};
			$scope.$new = sinon.stub().returns(dummyChildScope);
			return dummyChildScope;
		}

		suite('on openLoading event', function(){
			var clock;
			setup(function () {
				clock = sinon.useFakeTimers();
				loadingService.openLoading = sinon.stub();
				$scope.hooks={
					appLoading: 'loadingTemplate.tpl'
				};
			});

			teardown(function (){
				clock.restore();
			});

			function execute () {
				$scope.$broadcast('openLoading', {type:"test", openType: "attached_application"});
			}

			test('should call to loadingService.openLoading with correct params', sinon.test(function(){
				var dummyChildScope = createDummyChildScope();
				execute();
				assert(loadingService.openLoading.calledWithExactly(dummyChildScope, 'loadingTemplate.tpl', "attached_application"));
			}));

			test('should call loadingService.replaceLastLoadingAppTemplate when a timeout finishes', function(){
				var loadingServiceTeplaceLastLoadingAppTemplateStub = sinon.stub(loadingService, 'replaceLastLoadingAppTemplate');
				execute();
				clock.tick(settings.LOADING_TIMEOUT);
				sinon.assert.calledOnce(loadingServiceTeplaceLastLoadingAppTemplateStub);
				sinon.assert.calledWithExactly(loadingServiceTeplaceLastLoadingAppTemplateStub, 'vdiConnectionError');
			});

		});

		suite('on reopenLoading event', function(){
			function execute (loadingWindowInfo) {
				$scope.$broadcast('reopenLoading', loadingWindowInfo);
			}

			test('should call to loadingService.openLoading with correct params', sinon.test(function(){
				var loadingWindowInfo = {};
				this.stub(loadingService, 'reopenLoading');
				execute(loadingWindowInfo);
				assert(loadingService.reopenLoading.calledWithExactly(loadingWindowInfo));
			}));

		});


		suite('removeLoading ', function(){
			var clock;

			setup(function () {
				clock = sinon.useFakeTimers();
			});

			teardown(function (){
				clock.restore();
			});

			function exercise () {
				$scope.removeLoading ();
			}

		    test('should call loadingService.removeLoading', sinon.test(function(){
			    loadingService.removeLoading = sinon.stub();
			    exercise();
			    assert(loadingService.removeLoading.calledWithExactly());
		    }));

		    test('should call $scope.$apply', function(){
			    var _apply = sinon.stub($scope, '$apply');
			    exercise();
				clock.tick(10);
			    sinon.assert.calledOnce(_apply);
		    });
		});

		suite('onAppLoaded event received from desktopBus', function(){
			function exercise (){
				DesktopBus.dispatch("appLoaded");
			}

		    test('should call loadingService.closeLoading', sinon.test(function(){
			    this.stub(loadingService,'closeLoading');
		        exercise();
			    assert(loadingService.closeLoading.calledWithExactly());
		    }));

		    test('should call loadingService.closeLoading', sinon.test(function(){
			    this.stub($scope,'$apply');
		        exercise();
			    assert($scope.$apply.calledWithExactly());
		    }));

		});

	});
});
