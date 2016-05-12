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
    'windows/newPopupWindow/openedPopupWindows',
    'windows/newPopupWindow/popupWindow'
], function (OpenedPopupWindows, PopupWindow) {
    var sut = null;
    var dummyWindow = null;
    var anotherWindow = null;
    var firstWindowId = "firstWindow";
    var secondWindowId = "secondWindow";

    suite('OpenedPopupWindows', function() {
        setup(function() {
            constructSut();
        });

        function isMAC () {
            return navigator.platform.indexOf("Mac") !== -1;
        }

        test("popupOpened with a popupWindow should add a window to the collection", function() {
            //GUARD ASSERTION
            assert.equal(0, sut.getNumberOfWindows());
            sut.popupOpened(dummyWindow);
            assert.equal(1, sut.getNumberOfWindows());
        });

        test("recoverFocus will call to all registered windows and call to enableFocus with false", sinon.test(function() {
            if(!isMAC()){
                configureSutWithOneWindow();
                this.mock(dummyWindow).expects("enableFocus").once().withExactArgs(false);
                sut.recoverFocus();
            }
        }));

        test("recover focus will call to all registed windows focus", sinon.test(function() {
            if(!isMAC()){
                configureSutWithOneWindow();
                this.mock(dummyWindow).expects("focus").once();
                sut.recoverFocus();
            }
        }));

        test("close will call to all registered windows closeSilent", sinon.test(function() {
            configureSutWithOneWindow();
            this.mock(dummyWindow).expects("closeSilent").once();
            sut.close();
        }));

        test("reset will call to all registered windows resetPopup", sinon.test(function() {
            configureSutWithOneWindow();
            this.mock(dummyWindow).expects("resetPopup").once();
            sut.reset();
        }));

        test("popupClosed called with a window will remove the window", sinon.test(function() {
            configureSutWithTwoWindows();
            //GUARD ASSERTION
            assert.equal(2, sut.getNumberOfWindows());
            sut.popupClosed(anotherWindow);
            assert.equal(1, sut.getNumberOfWindows());
            assert.isFalse(sut.exists(anotherWindow));
        }));

        test("moveToTop called with a window will set the window the last inserted in the list", sinon.test(function() {
            configureSutWithTwoWindows();
            //GUARD ASSERTION
            assert.equal(anotherWindow, sut.getTopWindow());
            sut.moveToTop(dummyWindow);
            assert.equal(dummyWindow, sut.getTopWindow());
        }));
    });

    //region testUtilities
    function constructSut(){
        dummyWindow = constructPopupWindow(firstWindowId);
        anotherWindow = constructPopupWindow(secondWindowId);
        sut = new OpenedPopupWindows({
            DESKTOP_MODE_RECOVER_WINDOW: true
        });
    }

    function constructPopupWindow(id) {
        var window = new PopupWindow();
        window.id = id;
        window.popupPointer = constructFakeWindow();
        return window;
    }

    function constructFakeWindow() {
        return new FakeWindow();
    }

    function FakeWindow() {
        this.focus = function() {}
    }

    function configureSutWithTwoWindows(){
        configureSutWithOneWindow();
        sut.popupOpened(anotherWindow);
    }

    function configureSutWithOneWindow() {
        sut.popupOpened(dummyWindow);
    }
    //endregion
});
