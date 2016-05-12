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
	'windows/windowsService',
	'windows/eyeWindowDirective',
	'windows/newPopupWindow/popupFactory',
	'windows/newPopupWindow/popupWindowManager',
	'windows/windowListService'
], function(WindowManagerService, eyeWindowDirective, PopupFactory, PopupWindowManager, WindowListService) {
	suite('Directive: eyeWindow', function () {
		var element,
			scope, $compile, popupFactory,
			windowManager, windowTemplateFactory,
			fakeWindow,
			expectsCreateFromElement, expectsOpenWindow, expectsWindowContentCalled,
			busWindowManager, busWindowManagerMock, busWindowManagerAddExp,
			clock, windowListService;

		setup(function () {
			windowListService = new WindowListService();
			sinon.stub(windowListService, 'addWindow');

			module('eyeWindows');

			var fakeSignals = {
				sigs: {},
				on: function (name, callback) {
					this.sigs[name] = callback;
				},
				emit: function (name, data) {
					this.sigs[name](data);
				}

			};
			fakeWindow = {
				fromElement : function () {},
				open: function () {},
				close: sinon.stub(),
				signals: fakeSignals,
				width: 50,
				height: 50,
				$content: {
					height: function () {}
				},
				id: 'fakeId'
			};

			var windowContentMock = sinon.mock(fakeWindow.$content);
			var windowMock = sinon.mock(fakeWindow);
			popupFactory = new PopupFactory();
			windowManager = new PopupWindowManager();
			PopupFactory.getWindowManager = function() {
				return windowManager;
			};

			expectsOpenWindow = windowMock.expects('open').once();
			expectsWindowContentCalled = windowContentMock.expects('height').once();

			var windowCreatorMock = sinon.mock(windowManager.createWindow);
			expectsCreateFromElement = windowCreatorMock.expects('fromElement').once().returns(fakeWindow);

			busWindowManager = {add:function () {}};
			busWindowManagerMock = sinon.mock(busWindowManager);
			busWindowManagerAddExp = busWindowManagerMock.expects('add')
				.once().withExactArgs(fakeWindow.id, fakeWindow);

			module(function ($provide) {
				$provide.value('WindowManagerService', popupFactory);
			});

			inject(function ($rootScope, _WindowTemplateFactory_, _$compile_) {
				scope = $rootScope.$new();
				scope.appData = {};
				scope.onRemove = sinon.stub();
				scope.$emit = sinon.stub();
				scope.$apply = sinon.stub();
				windowTemplateFactory = _WindowTemplateFactory_;
				$compile = _$compile_;
			})
		});


		function compileElement() {
			element = angular.element('<eye-window app-data="{}"></eye-window>');
			element = $compile(element)(scope);
		}

		function executeDirective(fakeCompiledElement) {
			fakeCompiledElement = fakeCompiledElement || {
				width: sinon.mock(),
				height: function(){},
				load: function() {},
				on: sinon.mock(),
				attr: function () {}
			};
			var fakeElement = {
				html: function(){},
				contents: sinon.stub().returns(fakeCompiledElement)
			};

			eyeWindowDirective(popupFactory, windowTemplateFactory, $compile, windowListService, busWindowManager)
				.compile(fakeElement)(scope, fakeElement);
		}

		test('create an iframe', function () {
			compileElement($compile);
			assert.equal(element.contents().prop("tagName"), "IFRAME");
		});

		test('call createWindow.fromElement with correct element', function () {
			var fakeElement = {
				width: function(){},
				height: function(){},
				load: function() {},
				on: function(){},
				attr: function () {}
			};
			expectsCreateFromElement.withArgs(fakeElement);
			executeDirective(fakeElement);
			expectsCreateFromElement.verify();
		});

		test('open a window', function () {
			compileElement($compile);
			expectsOpenWindow.verify();
		});

		test('save created window inside scope.appData', sinon.test(function(){
			executeDirective();
			assert.isDefined(scope.appData.eyeWindow, 'eyeWindow not appended to app');
		}));

		test('when called should set window height from iframe height', function () {
			executeDirective();
			expectsWindowContentCalled.verify();
		});

		test('adds windowid attr to content', function () {
			var fakeElement = {
				width: function () {},
				height: function () {},
				load: function () {},
				on: function () {},
				attr: sinon.expectation.create('attr')
			};

			fakeElement.attr.once().withExactArgs('windowid', fakeWindow.id);
			executeDirective(fakeElement);
			fakeElement.attr.verify();
		});

		test('calls busWindowManager with the window and the windowId', function () {
			executeDirective();
			busWindowManagerAddExp.verify();
		});

		test('adds the window id to the windowListService for ventus', function () {
			executeDirective();
			sinon.assert.calledWithExactly(windowListService.addWindow, fakeWindow.id, fakeWindow);
		});

		test('adds the window id to the windowListService for popups', function () {
			var id = fakeWindow.id;
			fakeWindow.getId = function () {
				return id;
			};
			executeDirective();
			sinon.assert.calledWithExactly(windowListService.addWindow, id, fakeWindow);
		});

		function testWindowCreationOnEvent(eventName, type) {

			function exerciseReacreateWindowWithType(eventName, type) {
				executeDirective();
				fakeWindow.signals.emit(eventName, fakeWindow);
				clock.tick(0);
			}

			suite('when is detaching a loading window', function(){
				setup(function () {
					scope.appData.isLoading = true;
				});

				test('emits a reopenLoading signal with correct data', function(){
					exerciseReacreateWindowWithType(eventName, type);
					sinon.assert.calledWithExactly(scope.$emit, 'reopenLoading', scope.appData);
				});
			});

			suite('when is detaching a regular app ', function(){
				test('removes the window from the scope', function () {
					exerciseReacreateWindowWithType(eventName, type);
					sinon.assert.called(scope.onRemove);
				});

				test('opens a new type app', function () {
					exerciseReacreateWindowWithType(eventName, type);
					assert.equal(scope.appData.openType, type);
					sinon.assert.calledWithExactly(scope.$emit, 'openApp', scope.appData);
				});
			});

			test('closes the window when detached', function () {
				exerciseReacreateWindowWithType(eventName, type);
				sinon.assert.called(fakeWindow.close);
			});

			test('displays the window changes', function () {
				exerciseReacreateWindowWithType(eventName, type);
				sinon.assert.called(scope.$apply);
			});
		}

		suite("on window detach", function () {
			setup(function () {
				clock = sinon.useFakeTimers();
				windowTemplateFactory.oldGetWindow = windowTemplateFactory.getWindow;
				sinon.stub(windowTemplateFactory, 'getWindow', function (url, data) {
					var item = windowTemplateFactory.oldGetWindow(url, data);
					item.constructor = function fakeConstructor () {};
					return item;
				});

			});

			teardown(function () {
				clock.restore();
			});

			testWindowCreationOnEvent('detach', 'detached_application');
		});

		suite("on window attach", function () {
			setup(function () {
				clock = sinon.useFakeTimers();
				windowTemplateFactory.oldGetWindow = windowTemplateFactory.getWindow;
				sinon.stub(windowTemplateFactory, 'getWindow', function (url, data) {
					var item = windowTemplateFactory.oldGetWindow(url, data);
					item.constructor = function fakeConstructor() {
					};
					return item;
				});
			});

			teardown(function () {
				clock.restore();
			});

			testWindowCreationOnEvent('attach', 'attached_application');
		});
	});
});
