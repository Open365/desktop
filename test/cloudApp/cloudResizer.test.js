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
	'modules/cloudApp/cloudResizer'
], function (CloudResizer) {
	suite("SpiceCallback", function () {
		var sut, app, cloudResizer;
		var desktopBus;
		var resolution = {
			width: 200,
			hegith: 200,
			scaleFactor: 2
		};
		var clock;
		setup(function () {
			clock = sinon.useFakeTimers();
			app = {
				sendCommand: sinon.stub(),
				toSpiceResolution: sinon.stub()
			};
			app.toSpiceResolution.returns(resolution);

			desktopBus = new window.FakeDesktopBus();
			sut = new CloudResizer(app, cloudResizer, desktopBus);

			sinon.stub(sut, 'getContainer').returns({
				width: function () {
					return 100;
				},
				height: function () {
					return 100;
				}
			});
		});

		teardown(function () {
			clock.restore();
		});

		suite("#resize", function () {
			test("sends resize command to the spice", function () {
				sut.resize();
				clock.tick(100);
				var cmd = "setcustomresolution " + resolution.width + " " + resolution.height + " 59.90";
				sinon.assert.calledWithExactly(app.sendCommand, 'run', {"cmd": cmd});

			});
		});
	});
});
