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
	'windows/focusDetector'
], function (FocusDetector) {
	suite('focusDetector suite', function () {
		var sut;

		setup(function () {
			sut = new FocusDetector();
		});


		suite('#registerWindow', function () {
			var dummyWindow;

			setup(function () {
				dummyWindow = createDummyWindow();
			});

			function exercise(dummyWindow) {
				sut.registerWindow(dummyWindow, 'myType');
			}

			test('when passed window receives focus should set the window to lastWindowFocused', sinon.test(function () {
				exercise(dummyWindow);
				dummyWindow.dispatchEvent(new Event('focus'));
				assert.equal(sut.lastFocused, 'myType');
			}));

			test('when passed window is already focused when registered should set the window to lastWindowFocused', sinon.test(function(){
				dummyWindow.document.hasFocus.returns(true);
				exercise(dummyWindow);
				assert.equal(sut.lastFocused, 'myType');
			}));
		});


		function createDummyWindow () {
			var dummyWindow = document.createElement('window');
			dummyWindow.document = createFakeDocument();
			return dummyWindow;
		}

		function createFakeDocument () {
			return {
				hasFocus: sinon.stub()
			}
		}

	});

});
