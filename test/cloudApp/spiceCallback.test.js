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
	'modules/cloudApp/spiceCallback'
], function (SpiceCallback) {
	suite("SpiceCallback", function () {
		var sut, app, cloudResizer;
		var desktopBus;
		setup(function () {
			app = {
				sendCommand: sinon.stub()
			};

			cloudResizer = {
				resize: sinon.stub()
			};

			desktopBus = new window.FakeDesktopBus();
			sut = new SpiceCallback(app, cloudResizer, desktopBus);
		});

		teardown(function () {

		});

		suite("#callback", function () {
			test("on fileShare notifies fileShare.downloadUrl through desktopbus", function () {
				var expected = 'fakeData';
				var called = false;
				desktopBus.subscribe('fileShare.downloadUrl', function (actual) {
					called = true;
					assert.equal(expected, actual);
				});

				sut.callback('fileShare', {
					value: expected
				});

				assert.isTrue(called, "fileShare never notifies the sharing");


			});
		});
	});
});
