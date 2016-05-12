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
	'windows/busWindowManager'
], function(BusWindowManager) {
	suite('BusWindowManager', function () {
		var sut, wm, options, win, fakeId;
		var bus, busMock, busMockSubscribeExp, channel;
		var sutMock, sutMockPerformActionExp, action, fakeEvent, data;

		setup(function () {
			bus = {
				subscribe: function () {},
				dispatch: function () {}
			};

			channel = 'fakeChannel';

			sut = new BusWindowManager(bus, channel);

			options = {};
			win = {
				signals: {
					on: function () {}
				},
				move: function () {},
				close: function () {},
				focus: function () {},
				resize: function () {},
				resizeContent: function () {},
				restore: function () {},
				minimize: function () {},
				maximize: function () {},
				displayMessage: function () {},
				height: 50,
				width: 80,
				$titlebar: {
					height: function () {
						return titlebarHeight;
					}
				},
				$content: {
					width: function () {},
					height: function () {}
				}
			};

			fakeId = 'this is a fake id';

			busMock = sinon.mock(bus);
			busMockSubscribeExp = busMock
				.expects('subscribe')
				.once()
				.withExactArgs(channel + '.*', sinon.match.func);

			action = 'fakeAction';
		});

		teardown(function () {

		});

		suite('add', function () {
			test('stores the window', function () {
				sut.add(fakeId, win);
				var result = sut.get(fakeId);
				assert.equal(result, win);
			});

		});

		suite('listenToBus', function () {
			setup(function () {
				data = "fakeData";
				fakeEvent = {
					topic: channel + "." + action
				};

				sutMock = sinon.mock(sut);
				sutMockPerformActionExp = sutMock
					.expects('performAction')
					.once()
					.withExactArgs(action, data);
			});

			test('subscribes to all channel events', function () {
				sut.listenToBus(channel);
				busMockSubscribeExp.verify();
			});

			test('callback calls perform action with the action and the data', function () {
				var fakeBus = {
					subscribe: function (a, b) {
						b(data, fakeEvent);
					}
				};
				sut.listenToBus(fakeBus, channel);
			});
		});

		suite('performAction', function () {
			setup(function () {
				data = {
					id: 'fakeId'
				};
			});
			function execute () {
				return sut.performAction(action, data);
			}

			function expectsCallToBroadcastAction() {
				this.mock(sut)
					.expects('broadcastAction')
					.once()
					.withExactArgs(action, data);
			}

			test('calls performWindowAction if the passed id matches a window', sinon.test(function(){
			    this.mock(sut)
				    .expects('performWindowAction')
				    .once()
				    .withExactArgs(win, action, data);
				sut.add(data.id, win);
				execute();
			}));

			test('broadcasts action to all windows if there is not any id', sinon.test(function(){
				delete data.id;
				expectsCallToBroadcastAction.call(this);
				execute();
			}));

			test('broadcasts action to all windows if there is not data', sinon.test(function(){
				data = null;
				expectsCallToBroadcastAction.call(this);
				execute();
			}));

			test('do nothing if the passed id doesn\'t match any window', sinon.test(function(){
				data = {
					id: 'notExistingId'
				};
				this.mock(sut)
					.expects('performWindowAction')
					.never();
			}));

		});

		suite('performWindowAction', function () {

			setup(function () {
				performActionData.zoomed = 0;
			});

			var performActionData = {
				id: fakeId,
				left: "100",
				top: "200",
				width: "300",
				height: "400",
				zoomed: 0
			};

			var testData = [{
				action: "windowClose",
				method: "close"
			},{
				action: "windowMove",
				method: "move",
				args: [+performActionData.left, +performActionData.top]
			},{
				action: "windowResize",
				method: "resizeContent",
				args: [+performActionData.width, +performActionData.height]
			},{
				action: "windowMinimize",
				method: "minimize"
			},{
				action: "windowMaximize",
				method: "maximize"
			},{
				action: "windowFocus",
				method: "focus"
			},{
				action: "windowDisplayMessage",
				method: "displayMessage",
				args: [performActionData]
			}];

			testData.forEach(function (data) {
				createPerformWindowActionTest(data.action, data.method, data.args);
			});

			function createPerformWindowActionTest (action, method, args) {
				test("calls win." + method + " when action is " + action, function () {
					sut.add(performActionData.id, win);
					var exp = sinon.mock(win).expects(method);

					if (args) {
						exp = exp.withExactArgs.apply(exp, args);
					}

					sut.performWindowAction(win, action, performActionData);
					exp.verify();
				});
			}

			test('does not call win.maximized(false) when action is windowRestore and data.zoomed = 1', function () {
				performActionData.zoomed = 1;
				sut.add(performActionData.id, win);
				var exp = sinon.mock(win).expects('maximize').never();
				sut.performWindowAction(win, 'windowRestore', performActionData);
				exp.verify();
			});
		});

		suite('#broadcastAction', function(){
			function execute () {
				return sut.broadcastAction(action, data);
			}
		    test('sends the action with the data to all windows', sinon.test(function(){
		        this.mock(sut)
			        .expects('performWindowAction')
			        .exactly(3)
			        .withExactArgs(win, action, data);

			    sut.add('id_1', win);
			    sut.add('id_2', win);
			    sut.add('id_3', win);
			    execute();
		    }));
		});

		suite('addListenersToWindow', function(){
			var registeredEvents;
			setup(function () {
				registeredEvents = {};
				win.signals.on = function (eventName, eventHandler) {
					registeredEvents[eventName] = eventHandler;
				};
			});

			function prepareExecute() {
				sut.addListenersToWindow(fakeId, win);
			}

			function triggerEvent (eventName) {
				return registeredEvents[eventName](win);
			}

			test('on restore should dispatch correct event with correct data', sinon.test(function(){
				this.mock(bus)
					.expects('dispatch')
					.once()
					.withExactArgs(channel+".windowRestored", {
						id: fakeId,
						height: win.$content.height(),
						width: win.$content.width()
					});

				prepareExecute();
				triggerEvent('restore');
			}));
		});
	});
});
