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
	'utils/emitter',
	"windows/newPopupWindow/appTopbar/appTopbarController"
], function (Emitter, appTopbarController) {
	suite("appTopbarController", function () {
		var sut, $scope, windowListService, fakewin, signals;

		setup(function () {
			$scope = {};
			signals = new Emitter();

			fakewin = {
				signals: signals
			};

			windowListService = {
				getWindow: function () {
					return fakewin;
				}
			};
			sut = appTopbarController;
		});

		teardown(function () {

		});

		suite("#attach", function () {
			test("notifies the window to attach to the desktop", function (done) {
				fakewin.signals.on('attach', function (win) {
					done();
					assert.equal(fakewin, win);
				});

                sut($scope, windowListService);
				$scope.attach({
					currentTarget: []
				});

			});
		});
	});
});
