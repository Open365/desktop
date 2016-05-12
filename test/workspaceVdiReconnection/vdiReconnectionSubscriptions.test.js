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
	'modules/workspaceVdiReconnection/vdiReconnectionSubscriptions'
], function (VdiReconnectionSubscriptions) {

	suite('VdiReconnectionSubscriptions', function () {
		var sut, desktopBus, eyeosTranslatorFake;

		setup(function () {
			eyeosTranslatorFake = {
				translate: function (arrayToTranslate) {
					for (var i in arrayToTranslate) {
						arrayToTranslate[arrayToTranslate[i]] = arrayToTranslate[i];
					}

					return {
						then: function (func) {
							return func(arrayToTranslate);
						}
					}
				}
			};

			desktopBus = new FakeDesktopBus();

			sut = new VdiReconnectionSubscriptions(eyeosTranslatorFake, desktopBus);

		});


		suite('#subscribe', function () {
			function execute(eventName) {
				sut.subscribe();
				desktopBus.dispatch(eventName);
			}

			test('when connection is lost calls vdiReconnectionFeedback.blockVdiWindows with correct args', sinon.test(function () {
				this.mock(sut.vdiReconnectionFeedback)
					.expects('blockVdiWindows')
					.withExactArgs('Connection lost. Now trying to reconnect');

				execute('vdiconnect.error');
			}));

			test('when connection is definitely lost calls vdiWindowErrorHandler.closeAllVdiWindows', sinon.test(function () {
				this.mock(sut.vdiReconnectionFeedback)
					.expects('closeAllVdiWindows')
					.withExactArgs('VDI connection definitely lost. You may have lost some files changes');

				execute('vdiconnect.lost');
			}));

		});
	});
});
