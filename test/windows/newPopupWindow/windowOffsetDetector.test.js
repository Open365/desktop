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
    "windows/newPopupWindow/windowOffsetDetector",
    "settings"
], function(WindowOffsetDetector,settings) {
    var sut = null;
    var dummyPointer = null;
    var testX = 10;
    var testY = 20;
    var actualXOffset = null;
    var actualYOffset = null;
    var clock = null;

    suite("WindowOffsetDetector", function() {
        setup(function() {
            constructSut();
            clock = sinon.useFakeTimers();

        });

        teardown(function() {
            clock.restore();
        });


        test("open will call to window open with correct data", sinon.test(function(){
            this.mock(window).expects("open").once().withExactArgs('/popup/load.html', 'loading', 'width=100,height=100').returns(dummyPointer);
            sut.open();
        }));

        test("open when window.open returns undefined should raise exception", sinon.test(function() {
            this.stub(window, "open", function() {
                return undefined;
            });
            chai.expect(sut.open).to.throw("cannot open window");
        }));

        test("moveToDetectDecoratorOffset will call to popupPointer moveTo with the specified x and y", sinon.test(function() {
            this.mock(dummyPointer).expects("moveTo").once().withExactArgs(testX, testY);
            exerciseMoveToDetectDecoratorOffset();
        }));

        test("moveToDetectDecoratorOffset will call _detectFinished if window movement is finished", function() {

            dummyPointer.screenX = 100;
            dummyPointer.screenY = 100;
            dummyPointer.outerHeight = 100;
            dummyPointer.innerHeight = 110;

            sinon.spy(sut, "_detectFinished");
            exerciseMoveToDetectDecoratorOffset();
            clock.tick(101);
            sinon.assert.calledOnce(sut._detectFinished);
        });

        suite("moveToDetectDecoratorOffset detection failures", function () {
            var data = [
                {
                    screenX: 100,
                    screenY: 100,
                    outerHeight: 100,
                    innerHeight: 100
                },
                {
                    screenX: 100,
                    screenY: 100,
                    outerHeight: 100,
                    innerHeight: 0
                },                {
                    screenX: 100,
                    screenY: 100,
                    outerHeight: 0,
                    innerHeight: 100
                }

            ];

            var testWithData = function (dataItem) {
                return function () {
                    console.log(dataItem);
                    dummyPointer.screenX = dataItem.screenX;
                    dummyPointer.screenY = dataItem.screenY;
                    dummyPointer.outerHeight = dataItem.outerHeight;
                    dummyPointer.innerHeight = dataItem.innerHeight;

                    sinon.spy(sut, "_detectFinished");
                    var cb = function(){};
                    exerciseMoveToDetectDecoratorOffset(cb);
                    clock.tick((settings.WINDOW_OFFSET_DETECTOR_MOVETO_MAX_RETRIES+1)*100);
                    sinon.assert.calledWithExactly(sut._detectFinished, cb, testX, testY, true);
                };
            };

            data.forEach(function (dataItem) {
                test("moveToDetectDecoratorOffset not call _detectFinished if window movement is in progress", testWithData(dataItem));
            });
        });

    });

    //region testutilities
    function exerciseMoveToDetectDecoratorOffset(cb) {
        cb = cb || function(xOffset, yOffset){
                actualXOffset = xOffset;
                actualYOffset = yOffset;
            };
        sut.moveToDetectDecoratorOffset(testX,testY, cb);
    }
    function constructSut() {
        dummyPointer = constructFakePointer();
        sut = new WindowOffsetDetector();
        sut.popupPointer = dummyPointer;
    }
    function constructFakePointer() {
        return {
            close : function() {},
            moveTo : function(x,y) {
                sut.popupPointer.screenX = x;
                sut.popupPointer.screenY = y;

            }
        };
    }
    //endregion
});
