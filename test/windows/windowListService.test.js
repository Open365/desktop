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
	"windows/windowListService"
], function (WindowListService) {
	suite("WindowListService", function () {
		var sut, fakewin, winId, signals;


		setup(function () {
			signals = {
				sigs: {},
				on: function (name, cb) {
					this.sigs[name] = cb;
				},

				emit: function (name, data) {
					this.sigs[name] && this.sigs[name](data);
				}
			};
			fakewin = {
				signals: signals
			};
			winId = "fakeWinId";
			sut = new WindowListService();
		});

		teardown(function () {

		});

		suite("#getWindow and addWindow", function () {
			test("returns stored window", function () {
                sut.addWindow(winId, fakewin);
				var res = sut.getWindow(winId);

				assert.equal(res, fakewin);
			});

		});

		suite("#addWindow", function () {
			test("removes the window when it is closed", function () {
				sut.addWindow(winId, fakewin);
				fakewin.signals.emit('closeDone');
				var res = sut.getWindow(winId);
				assert.isUndefined(res);
			});
		});
	});
});
