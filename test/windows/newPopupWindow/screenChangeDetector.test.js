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
    'windows/newPopupWindow/screen',
    'windows/newPopupWindow/popupWindowOffsets'
], function(Screen, PopupWindowOffsets) {

    suite('Screen', function () {
        var popupWindowOffsets = new PopupWindowOffsets({}),
	        sut;

        var data = [
            [true, {width: 0, height: 0}, {screenX: 50, screenY: 0}, {screenX: 100, screenY: 0}, false],
            [true, {width: 100, height: 0}, {screenX: 300, screenY: 0}, {screenX: 100, screenY: 0, width: 100, height: 100}, false],
            [true, {width: 0, height: 0}, {screenX: 0, screenY: 50}, {screenX: 0, screenY: 100}, false],
            [true, {width: 0, height: 100}, {screenX: 0, screenY: 300}, {screenX: 0, screenY: 100, width: 100, height: 100}, false],
            [false, {width: 0, height: 0}, {screenX: 0, screenY: 0}, {screenX: 0, screenY: 0}, true]
        ];

        setup(function () {
            sut = new Screen(popupWindowOffsets);
        });

	    teardown(function () {
		   popupWindowOffsets.getScreenX.restore();
		   popupWindowOffsets.getScreenY.restore();
	    });

        var testWithData = function (singleScreenMode, currentScreenSize, currentWinCoordinates, offsetCoordinates, expected) {
            return function () {
	            sinon.stub(popupWindowOffsets, 'getScreenX').returns(offsetCoordinates.screenX);
	            sinon.stub(popupWindowOffsets, 'getScreenY').returns(offsetCoordinates.screenY);

                var actual = sut.isIn(singleScreenMode, currentScreenSize, currentWinCoordinates, offsetCoordinates);
                assert.equal(expected, actual);
            };
        };

        data.forEach(function (data, i) {
            test("data_provider test", testWithData(data[0], data[1], data[2], data[3], data[4]));
        });

    });
});
