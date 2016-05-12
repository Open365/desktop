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
    "windows/newPopupWindow/popupWindowOffsets",
    "windows/newPopupWindow/windowOffsetDetector",
    "settings"
], function(PopupWindowOffsets, WindowOffsetDetector,settings) {
    var sut = null;
    var dummyDetector = null;
    var testScreenX = 100;
    var testScreenY = 200;
    var testX = 10;
    var testY = 20;
    var dummyPointer = null;
    var testCoordinates = null;
    var clock = null;

    suite("PopupWindowOffsets", function() {
        setup(function() {
            constructSut();
            clock = sinon.useFakeTimers();
        });

        teardown(function() {
            clock.restore();
        });

        test("detect should call detector open", sinon.test(function() {
            this.mock(dummyDetector).expects("open").once();
            exerciseDetectWithXAndY();
        }));

        test("detect set ScreenX to the ScreenX of the windowDetector", function() {
            //GUARD ASSERTION
            assert.equal(0, sut.screenX);
            exerciseDetectWithXAndY();
            fireEventInPopupPointer('load');
        });

        test("detect set ScreenY to the ScreenY of the windowDetector", function() {
            //GUARD ASSERTION
            assert.equal(0, sut.screenY);
            exerciseDetectWithXAndY();
            fireEventInPopupPointer('load');
            assert.equal(testScreenY, sut.screenY);
        });

        test("detect should call to moveToDetectDecoratorOffset with x and y", sinon.test(function() {
            this.mock(dummyDetector).expects("moveToDetectDecoratorOffset").once().withExactArgs(testX, testY, sinon.match.func);
            exerciseDetectWithXAndY();
            fireEventInPopupPointer('load');
        }));

        test("detect called without x and y should call to moveToDetectDecoratorOffset with the screenX and screeny plus increment", sinon.test(function() {
            var y = testScreenY + PopupWindowOffsets.SCREEN_INCREMENT;
            var x = testScreenX + PopupWindowOffsets.SCREEN_INCREMENT;
            this.mock(dummyDetector).expects("moveToDetectDecoratorOffset").once().withExactArgs(x, y, sinon.match.func);
            exerciseWithoutXAndY();
            fireEventInPopupPointer('load');
        }));

        test("detectOnlyOnce called if offsets are not detected yet should call to detect", sinon.test(function() {
            sut.detectStatus = sut.detectionStates.UNDETECTED;
            this.mock(sut).expects("detect").once().withExactArgs(null, null, sinon.match.func);
            exerciseDetectOnlyOnce();
        }));

        test("detectOnlyOnce if offsets are already detected should call the callback but not call detect", sinon.test(function() {
            dummyPointer = sinon.stub();
            sut.detectStatus = sut.detectionStates.DETECTED;
            this.mock(sut).expects("detect").never();
            exerciseDetectOnlyOnce();
            sinon.assert.calledOnce(dummyPointer)
        }));

        test("detectOnlyOnce if offsets are being detected shouldn\'t call the callback neither call detect", function() {
            dummyPointer = sinon.stub();
            sut.detectStatus = sut.detectionStates.INPROGRESS;
            sinon.mock(sut).expects("detect").never();
            exerciseDetectOnlyOnce();
            clock.tick(100 * (settings.WINDOW_OFFSET_DETECTOR_WAITFOR_MAX_RETRIES+1));
            sinon.assert.neverCalledWith(dummyPointer);
        });



    });
    //region testutilities

    function exerciseDetectOnlyOnce() {
        sut.detectOnlyOnce(dummyPointer);
    }
    function exerciseWithoutXAndY() {
        sut.detect();
    }
    function exerciseDetectWithXAndY() {
        sut.detect(testX, testY);
    }
    function constructFakePointer() {
        return  {
            screenX : testScreenX,
            screenY : testScreenY,
            outerWidth: 10,
            outerHeight: 10,
            moveTo: function(){},
            addEventListener: function (event, handler){
            }
        };
    }
    function constructFakeCoordinates() {
        return {x:testX, y:testY};
    }
    function constructSut() {
        dummyDetector = new WindowOffsetDetector();
        dummyDetector.getScreenX = function() {
            return testScreenX;
        };
        dummyDetector.getScreenY = function() {
            return testScreenY;
        };
        dummyDetector.moveToDetectDecoratorOffset = function(){};
        dummyPointer = constructFakePointer();
        dummyDetector.popupPointer = dummyPointer;
        testCoordinates = constructFakeCoordinates();
        sut = new PopupWindowOffsets(dummyDetector);
    }

    function fireEventInPopupPointer (event) {
        dummyDetector.popupPointer.dispatchEvent(new Event(event));
    }
    //endregion
});
