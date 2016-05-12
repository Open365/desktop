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
    "windows/newPopupWindow/popupWindowManager",
    "windows/newPopupWindow/openedPopupWindows",
    "windows/newPopupWindow/popupWindowFactory",
    "windows/newPopupWindow/popupWindowOffsets",
    'windows/newPopupWindow/regularWindowDecorator',
    'windows/newPopupWindow/screen'
], function(PopupWindowManager, OpenedPopupWindows, popupWindowFactory, PopupWindowOffsets, RegularWindowDecorator, Screen) {

    var sut = null;
    var dummyRegistry = null;
    var dummyFactory = null;
    var dummyDomElement = null;
    var dummyOptions = null;
    var dummyOffsets = null;
    var dummyBaseElement = null;
    var dummyWindow = null;
    var dummyScreen = null;
    var currentSize = "current size";
    var currentCoordinates = "current coordinates";

    suite("PopupWindowManager", function() {
        setup(function() {
            constructSut();
            window.needToSetResolution = false;
        });

        function isMAC () {
			return navigator.platform.indexOf("Mac") !== -1;
        }

        test("dispose will call to registry close", sinon.test(function() {
            this.mock(dummyRegistry).expects("close").once();
            sut.dispose();
        }));

        test("createWindow.fromElement will call to factory getWindowFromElement with correct options", sinon.test(function() {
            if(!isMAC()){
                this.mock(dummyFactory).expects("getWindowFromElement").once().withExactArgs(dummyDomElement, dummyOptions, dummyOffsets, dummyRegistry).returns(dummyWindow);
                exerciseCreateWindow();
            }
        }));



        test("init should set needToSetResolution to true", function() {
            //GUARD ASSERTION
            assert.isFalse(window.needToSetResolution);
            sut.init();
            assert.isTrue(window.needToSetResolution);
        });

        test("resetOpenedPopupsOnDesktopScreenChange called with currentDesktopSize and currentDesktopCoordinates should call to screenChangeDetector isIn", sinon.test(function() {
            this.mock(dummyScreen).expects("isIn").once().withExactArgs(true, currentSize, currentCoordinates);
            exerciseResetOpenedPopupsOnDesktopScreenChange();
        }));

        test("resetOpenedPopupsOnDesktopScreenChange called with currentDesktopSize and currentDesktopCoordinates and not isInSameScreen should call to offsets detect", sinon.test(function() {
            this.stub(dummyScreen, "isIn", function(){
                return false;
            });
            this.mock(dummyOffsets).expects("detect").once();
            exerciseResetOpenedPopupsOnDesktopScreenChange();
        }));

        test("resetOpenedPopupsOnDesktopScreenChange called with currentDesktopSize and currentDesktopCoordinates and  isInSameScreen should not call to offsets detect", sinon.test(function() {
            this.stub(dummyScreen, "isIn", function(){
                return true;
            });
            this.mock(dummyOffsets).expects("detect").never();
            exerciseResetOpenedPopupsOnDesktopScreenChange();
        }));

    });

    //region testutilities
    function exerciseResetOpenedPopupsOnDesktopScreenChange() {
        sut._resetOpenedPopupsOnDesktopScreenChange(currentSize, currentCoordinates);
    }

    function exerciseCreateWindow() {
        return sut.createWindow.fromElement(dummyDomElement, dummyOptions);
    }

    function constructSut() {
        dummyRegistry = new OpenedPopupWindows();
        dummyFactory = popupWindowFactory;
        dummyDomElement = {};
        dummyOptions = {};
        dummyOffsets = new PopupWindowOffsets();
        dummyBaseElement = {};
        dummyWindow = constructFakeWindow();
        dummyScreen = new Screen();
        sut = new PopupWindowManager(dummyBaseElement, dummyFactory, dummyRegistry, constructFakeDocument(),
	        dummyOffsets, null, dummyScreen, null);
    }

    function constructFakeDocument() {
        return {
            addEventListener : function(){}
        }
    }

    function constructFakeWindow(){
        return {
            getSignals:function(){},
            setReadyCallBack:function(){},
            setWindowReady:function(){},
            getIsVdiWindow:function(){
                return false;
            },
            setSingleScreen:function(){},
            setUnclosable: function(){}
        };
    }
    //endregion

});
