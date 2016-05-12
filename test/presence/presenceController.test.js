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
	'modules/presence/presenceController',
	'modules/presence/request',
	'settings'
], function (Presence, Request, settings) {
	suite('PresenceController', function () {
		var sut;
		var clock, request, time;

		setup(function () {
			time = settings.PRESENCE_PING_INTERVAL;
			clock = sinon.useFakeTimers();
			request = new Request();
			sut = new Presence(request);
		});

		teardown(function () {
			clock.restore();
		});

		suite('#init', function () {
			test('calls to request.send again when interval is false and presence time has passed', function () {
				var exp = sinon.mock(request)
					.expects('send')
					.exactly(1+1);
				sut.init();
				clock.tick(time);
				exp.verify();
			});

			test('calls to request.send again 3 times when interval is false and (presence time * 3) have passed', function () {
				var exp = sinon.mock(request)
					.expects('send')
					.exactly(1+3);
				sut.init();
				clock.tick(time * 3);
				exp.verify();
			});

			test('does nothing when interval is not false', function () {
				var exp = sinon.mock(request)
					.expects('send')
					.never();
				sut.intervalId = 'fake value';
				sut.init();
				clock.tick(time);
				exp.verify();
			});
		});

		suite('#getDataForPresenceEvent', function () {
			test('returns an array with the subscription info', function () {
				var methodReference = sut.pong.bind(sut),
					expected = [
						{ eventName: 'pong', callback: methodReference }
					],
					current = sut.getDataForPresenceEvent(methodReference);
				assert.deepEqual(current, expected);
			});
		});

		suite('#stop', function () {
			var intervalId = 'fake interval id';
			function execute () {
				sut.intervalId = intervalId;
				sut.stop();
			}

			test('calls to window.clearInterval', sinon.test(function () {
				this.mock(window)
					.expects('clearInterval')
					.once()
					.withExactArgs(intervalId);
				execute();
			}));

			test('sut.intervalId is deleted', sinon.test(function () {
				execute();
				assert.isNull(sut.intervalId);
			}));
		});
	});

});
