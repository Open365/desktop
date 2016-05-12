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
    "windows/newPopupWindow/popupWindowFactory",
    'windows/newPopupWindow/regularWindowDecorator'
], function(PopupWindowFactory, RegularWindowDecorator) {
    var dummyWindow = null;
    var dummyDomElement = {};
    setup(function() {
        dummyWindow = constructFakeWindow();
        injectDummyWindow();
    });
    test("createWindow.fromElement will call to window setWindowReadyWithDomElement", sinon.test(function(){
        injectDummyWindow(this);
        this.mock(dummyWindow).expects("setWindowReady").once().withExactArgs(dummyDomElement);
        exerciseGetWindowFromElement();
    }));

    test("createWindow.fromElement if window is not vdi will return the window", function(){
        injectDummyWindow();
        var actual = exerciseGetWindowFromElement();
        assert.deepEqual(new RegularWindowDecorator(dummyWindow), actual);
    });

    test("createWindow.fromElement if window is not vdi is window is not vdi should never call to setSingleScreen", sinon.test(function() {
        injectDummyWindow(this);
        this.mock(dummyWindow).expects("setSingleScreen").never();
        exerciseGetWindowFromElement()
    }));

    test("createWindow.fromElement if window is not vdi is window is not vdi should never call to setUnclosable", sinon.test(function() {
        injectDummyWindow(this);
        this.mock(dummyWindow).expects("setSingleScreen").never();
        exerciseGetWindowFromElement()
    }));

    //region testutilities
    function configureWindowAsVDI(context) {

        context.stub(dummyWindow, "getIsVdiWindow", function(){
            return true;
        });
    }
    function injectDummyWindow(){
        PopupWindowFactory._constructInternalWindow = function() {
            return dummyWindow;
        };
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

    function exerciseGetWindowFromElement(){
        return PopupWindowFactory.getWindowFromElement(dummyDomElement);
    }
    //endregion
});
