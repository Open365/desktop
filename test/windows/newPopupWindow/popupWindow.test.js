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
    'windows/newPopupWindow/popupWindow',
    'windows/newPopupWindow/nativeWindow',
    'windows/newPopupWindow/popupWindowOffsets',
    'windows/newPopupWindow/openedPopupWindows',
    'utils/emitter',
	'windows/newPopupWindow/internalWindowFactory',
	'windows/newPopupWindow/components/content',
	'windows/newPopupWindow/appTopbar/appTopbarElem',
    'settings'
], function(PopupWindow, NativeWindow, PopupWindowOffsets, OpenedPopupWindows, Emitter, internalWindowFactory, Content,
            AppTopbar,settings) {

    var sut, dummyNativeWindow, dummyOffsets, dummyEmitter, dummyRegistry, dummyTopbar;
    var oldWindow = window;
    var testMoveX = 10;
    var testMoveY = 20;
    var testResizeWidth = 200;
    var testResizeHeight = 300;
    var clock = null;
    var currentNativeWindowX = 10;
    var currentNativeWindowY = 20;
    var currentNativeWindowWidth = 30;
    var currentNativeWindowHeight = 40;
	var windowId='win234';

    suite('PopupWindow', function() {
        setup(function() {
            oldWindow = window.eyeosVdiClient;
            prepareWindow();
            constructSut();
            clock = sinon.useFakeTimers();
        });

        teardown(function() {
            window.eyeosVdiClient = oldWindow;
            clock.restore();
        });

        test("closeSilent should set preventCloseEvent to 1", function() {
            sut.preventCloseEvent = 0;
            sut.closeSilent();
            assert.equal(1, sut.preventCloseEvent);
        });

        test("closeSilent should call to nativeWindow close", sinon.test(function(){
            this.mock(dummyNativeWindow).expects("close").once();
            sut.closeSilent();
        }));

        test("close should set unclosable to false", function() {
            sut.unclosable = true;
            sut.close();
            assert.isFalse(sut.unclosable);
        });

        test("close should call to nativeWindow close", function() {
            var stub = sinon.stub(dummyNativeWindow, "close");
            sut.close();
            clock.tick(71);
            sinon.assert.called(stub);
        });

        test("move when newX is different than oldX and newY is different than oldY and window isOutOfControl should emit resetPopUp", function() {
            sut.setOutOfControl(true);
            sinon.spy(dummyEmitter, "emit");
            exerciseMove();
            assert.deepEqual(['resetPopup', true], dummyEmitter.emit.getCall(0).args);
        });


        test("move when newX is different than oldX and newY is different than oldY and window isOutOfBoundaries should emit resetPopup", function() {
            configureIsOutOfBoundaries(true);
            sinon.spy(dummyEmitter, "emit");
            exerciseMove();
            assert.deepEqual(['resetPopup', true], dummyEmitter.emit.getCall(0).args);
        });

        test("move when newX is different than oldX and newY is different than oldY and window and window is not OutOControl and not OutOfBoundaries should call to native window moveTo", sinon.test(function(){
            sut.setOutOfControl(false);
            configureIsOutOfBoundaries(false);
            this.mock(dummyNativeWindow).expects("moveTo").once().withExactArgs(testMoveX, testMoveY);
            exerciseMove();
        }));

        test("move when newX is equal than oldX should not call to resetPopup", function() {
            configureNativeWindowPositionsAsStub(testMoveX, testMoveY);
            sinon.spy(dummyEmitter, "emit");
            exerciseMove();
            assert.equal(0, dummyEmitter.emit.getCalls().length);
        });

        test("move when newX is equal than oldX should not call to native window moveTo", sinon.test(function() {
            configureNativeWindowPositionsAsStub(testMoveX, testMoveY);
            sinon.spy(dummyEmitter, "emit");
            exerciseMove();
            this.mock(dummyNativeWindow).expects("moveTo").never();
        }));

        test("resizeContent when newWidth and newHeight are different from oldWith and oldHeight should call to nativePointer resizeTo with correct data", sinon.test(function() {
	        this.stub(dummyNativeWindow, "isInMasterScreen").returns(true);
	        this.stub(dummyTopbar, 'getHeight').returns(30);
            this.mock(dummyNativeWindow).expects("resizeTo")
	            .once().withExactArgs(testResizeWidth, testResizeHeight + dummyTopbar.getHeight());
            exerciseResizeContent();
        }));

        test("resizeContent when newWidth and newHeight are different from oldWith and oldHeight should set new size to $content", function() {
		    sinon.stub(dummyNativeWindow, "isInMasterScreen").returns(true);
		    exerciseResizeContent();
		    assert.equal(sut.$content.width(), testResizeWidth);
		    assert.equal(sut.$content.height(), testResizeHeight);
	    });

        test("minimize if window is not hidden should emit restore", sinon.test(function() {
            this.mock(dummyEmitter).expects("emit").once().withExactArgs("restore", sut);
            sut.minimize();
        }));

        test("minimize if window is hidden should not emit restore", sinon.test(function() {
            sut._isHidden = true;
            this.mock(dummyEmitter).expects("emit").never();
            sut.minimize();
        }));

        test("focus should call nativeWindow focus", sinon.test(function() {
            this.mock(dummyNativeWindow).expects("focus").once();
            sut.focus();
        }));

        test("displayMessage called with data should call nativeWindow displayMessage", sinon.test(function() {
            var data = "testData";
            this.mock(dummyNativeWindow).expects("displayMessage").once().withExactArgs(data);
            sut.displayMessage(data);
        }));

        suite('open', function (){
            setup(function (){
                stubGetWindow(sinon);
            });
            teardown(function (){
                restoreGetWindowStub(sinon);
            });

            test('open should call popupPointer.open', function(){
                sinon.mock(dummyNativeWindow).expects('open').once();
                sut.open();
            });

            test('open when is a vdiApp should set type vdiWindow to internal window', function(){
                sut._options.appData.isVdi = true;
                var setTypeStub = sinon.stub(dummyNativeWindow, 'setType');
                sut.open();
                sinon.assert.calledWith(setTypeStub, NativeWindow.VDI_WINDOW_TYPE);
            });

        });


        test("resetPopup and window is not VDI should not call nativeWindow close", sinon.test(function() {
            this.mock(dummyNativeWindow).expects("close").never();
            sut.isVdiWindow = false;
            sut.resetPopup();
        }));

        test("resetPopup and window is VDI should call nativeWindow close", sinon.test(function() {
            this.mock(dummyNativeWindow).expects("close").once();
            sut.isVdiWindow = true;
            sut.resetPopup();
        }));

        test("resetPopup and window is VDI should set _options to the current nativeWindow coordinates", sinon.test(function() {
            configureNativeWindowCoordinatesAsStub(this);
            sut.isVdiWindow = true;
            sut.resetPopup();
            assert.equal(sut._options.x, currentNativeWindowX);
            assert.equal(sut._options.y, currentNativeWindowY);
            assert.equal(sut._options.width, currentNativeWindowWidth+1);
            assert.equal(sut._options.height, currentNativeWindowHeight);
        }));

        test("removeMessage should call nartiveWindow removeMessage", sinon.test(function() {
            this.mock(dummyNativeWindow).expects("removeMessage").once();
            sut.removeMessage();
        }));

        test("setHidden when called and hidden status is the same as _hidden property should not emit", sinon.test(function() {
            sut._isHidden = true;
            this.mock(dummyEmitter).expects("emit").never();
            sut.setHidden(true);
        }));

        test("setHidden when called and hidden status is true and is different as _hidden property should emit minimize", sinon.test(function() {
            this.mock(dummyEmitter).expects("emit").once().withExactArgs("minimize", sut);
            sut.setHidden(true);
        }));

        test("setHidden when called and hidden status is false and is different as _hidden property should emit restore", sinon.test(function() {
            sut._isHidden = true;
            this.mock(dummyEmitter).expects("emit").once().withExactArgs("restore", sut);
            sut.setHidden(false);
        }));

        test("when signal close is received and window is closable it will call to registry popupClosed with current instance", sinon.test(function() {
            configureEmitterAsRegistry();
            sut.unclosable = false;
            this.mock(dummyRegistry).expects("popupClosed").once().withExactArgs(sut);
            dummyEmitter.executeEvent("close");
        }));

        test("when signal close is received and window is unclosable registry popupClosed never will be called", sinon.test(function() {
            configureEmitterAsRegistry();
            sut.unclosable = true;
            this.mock(dummyRegistry).expects("popupClosed").never();
            dummyEmitter.executeEvent("close");
        }));

        test("when signal focus is received will call to registry moveToTop with current instance", sinon.test(function() {
            configureEmitterAsRegistry();
            this.mock(dummyRegistry).expects("moveToTop").once().withExactArgs(sut);
            dummyEmitter.executeEvent("focus");
        }));

        test("when native window emits popupFocused will emit focus", sinon.test(function() {
            configureNativeWindowAsEventRegistry();
            this.mock(dummyEmitter).expects("emit").once().withExactArgs("focus");
            dummyNativeWindow.signals.executeEvent("popupFocused");
        }));


	    suite('setPopupPointerListeners', function(){
		    function exercise (event, args) {
		        configureNativeWindowAsEventRegistry();
		        sut.setPopupPointerListeners();
		        dummyNativeWindow.signals.executeEvent(event, args);
	        }

	        test("when native window emits appTopbarLoaded should store the passed topbar", sinon.test(function() {
		        dummyNativeWindow.resizeBy = sinon.stub();
		        sut.topbar = null;
		        exercise("appTopbarLoaded", [dummyTopbar]);
		        assert.equal(sut.topbar, dummyTopbar);
	        }));

		    test('should call resizeBy with topbarHeight', sinon.test(function () {
			    dummyNativeWindow.resizeBy = sinon.stub();
			    exercise("appTopbarLoaded", [dummyTopbar]);
			    assert(dummyNativeWindow.resizeBy.calledWithExactly(0, dummyTopbar.getHeight()), 'resizeBy not called properly');
		    }));


		    suite('popupLoaded Event', function(){
                var fakeWindow;

			    setup(function () {
                    settings.POPUP_WINDOW_TOPBAR_ACTIVE = true;
                    sut._options.$compile = "compile";
				    sut._options.$scope = {
					    hooks: {
						    popupTopbar: 'popupTopBarUrl'
					    }
				    };
				    dummyNativeWindow.addTopbar = sinon.stub();
				    sut.appendDomElement = sinon.stub();
				    sut.$content = null;
                    fakeWindow = constructFakeWindow();
			    });

		        test("when native window emits popupLoaded should initialize the $content", sinon.test(function() {
			        exercise("popupLoaded", [fakeWindow]);
			        assert.instanceOf(sut.$content, Content);
		        }));

                test("should add topbar to popup", function () {
                    exercise("popupLoaded", [fakeWindow]);
                    sinon.assert.calledWith(dummyNativeWindow.addTopbar, sut._options.$compile, sut._options.$scope, sinon.match.string);
                });
		    });


            suite('popupWindow events', function() {
                var fakeWindow;

                setup(function () {
                    settings.POPUP_WINDOW_TOPBAR_ACTIVE = true;
                    dummyNativeWindow.addTopbar = sinon.stub();
                    sut.appendDomElement = sinon.stub();
                    fakeWindow = constructFakeWindow();
                });

                test("when native VDI window emits popupResized, popupWindow should emit resize", function() {
                    sut.isVdiWindow = true;
                    var stub = sinon.stub(dummyEmitter, "emit");
                    exercise("popupResized", [fakeWindow]);
                    sinon.assert.calledWithExactly(stub, 'resize', sut);
                });


                test("when native VDI window emits popupResized, if there is a resizeTimer ongoing returns without action", function() {
                    sut.isVdiWindow = true;
                    sut.resizeTimer = 1;
                    var stub = sinon.stub(dummyEmitter, "emit");
                    exercise("popupResized", [fakeWindow]);
                    sinon.assert.notCalled(stub);
                });

                test("When resizeTimer runs out of iterations, a resize event should be fired", function() {
                    sut.isVdiWindow = true;
                    var stub = sinon.stub(dummyNativeWindow, "resizeTo");
                    exercise("popupResized", [fakeWindow]);
                    clock.tick(100 * (settings.POPUP_WINDOW_RESIZED_RETRIES+1));
                    sinon.assert.called(stub);
                });

            });

	    });

        suite('replaceContent', function(){
            var newDomElem, oldDomElem;

            setup(function () {
                newDomElem = $('<div>newDomElem</div>');
                oldDomElem = createDomElementAndInjectToSut();
            });

            function exercise (newDomElem) {
                return sut.replaceContent(newDomElem);
            }

            function createDomElementAndInjectToSut() {
                var oldDomElem = $('<div>oldDomElem</div>');
                sut._domElement = oldDomElem;
                return oldDomElem;
            }

            test('should replace the domElement property with the provided one', sinon.test(function(){
                exercise(newDomElem);
                assert.equal(sut._domElement, newDomElem);
            }));

            test('should remove old dom element from the dom', sinon.test(function(){
                var oldDomElemRemoveStub = sinon.stub(oldDomElem, 'remove');
                exercise(newDomElem);
                sinon.assert.called(oldDomElemRemoveStub);
            }));

            test('should call popupPointer.appendDomElement with provided domElement', function() {
                var popupPointerAppendDomElementStub = sinon.stub(dummyNativeWindow, 'appendDomElement');
                var domElement = $('<div>oldDomElem</div>');
                exercise(domElement);
                sinon.assert.calledWithExactly(popupPointerAppendDomElementStub, domElement);
            });
        });


    });



    //region testUtilities

	function stubGetWindow(scope) {
		scope.stub(internalWindowFactory, 'getWindow').returns(dummyNativeWindow);
	}

    function restoreGetWindowStub() {
        internalWindowFactory.getWindow.restore();
    }

    function configureNativeWindowAsEventRegistry() {
        dummyNativeWindow.signals = {};
        configureObjectEmitterAsRegistry(dummyNativeWindow.signals);
    }

    function configureEmitterAsRegistry() {
        configureObjectEmitterAsRegistry(dummyEmitter);
    }

    function configureObjectEmitterAsRegistry(object) {
        object.events =  {};
        object.on = function(event, fp    ) {
            object.events[event] = fp;
        };
	    object.off = function(event, fp) {
            delete object.events[event];
        };
        object.executeEvent = function(event, args) {
            object.events[event].apply(object, args);
        };
        sut._setWindowListeners(false);
    }

    function configureNativeWindowCoordinatesAsStub(scope) {
        scope.stub(dummyNativeWindow, "getX", function() {
            return currentNativeWindowX;
        });

        scope.stub(dummyNativeWindow, "getY", function() {
            return currentNativeWindowY;
        });

        scope.stub(dummyNativeWindow, "getWidth", function() {
            return currentNativeWindowWidth;
        });

        scope.stub(dummyNativeWindow, "getHeight", function() {
            return currentNativeWindowHeight;
        });
    }

    function exerciseResizeContent(){
        sut.resizeContent(testResizeWidth, testResizeHeight);
    }

    function configureNativeWindowPositionsAsStub(x, y) {
        sinon.stub(dummyNativeWindow, "getX", function() {
            return x;
        });
        sinon.stub(dummyNativeWindow, "getY", function() {
            return y;
        });
    }
    function configureIsOutOfBoundaries(isOutOfBoundaries) {
        sinon.stub(dummyNativeWindow, "isOutOfBoundaries", function() {
            return isOutOfBoundaries;
        });
    }
    function exerciseMove() {
        sut.move(testMoveX, testMoveY);
    }

    function constructSut() {
        dummyNativeWindow = new NativeWindow();
        dummyNativeWindow.popupPointer = constructFakeWindow();
        dummyOffsets = new PopupWindowOffsets();
        dummyNativeWindow._offsets = dummyOffsets;
        dummyEmitter = new Emitter();
        var options = {
            appData: {}
        };
        dummyRegistry = new OpenedPopupWindows();
        sut = new PopupWindow(options, dummyOffsets, dummyRegistry, dummyEmitter, settings);
	    sut.id = windowId;
        sut.popupPointer = dummyNativeWindow;
	    sut.$content = constructFakeContent();
	    dummyTopbar = constructTopbar();
	    sut.topbar = dummyTopbar;
    }

    function prepareWindow() {
        window.eyeosVdiClient = {
            vdiRunner: {
                application:{
                    setCurrentWindow: function() {}
                }
            }
        }
    }

    function FakeWindow() {
        this.screen = {};
        this.document = {
            body: {
                appendChild: function () {}
            },
            getElementById: function(){},
            hasFocus: function(){}
        };
        this.events = {};
        this.focus = function(){};
        this.resizeTo = function(){};
        this.close = function(){};
        this.moveTo = function(){};
        this.addEventListener = function (event, fp){
            this.events[event] = fp;
        };
        this.triggerEvent = function(event, args){
            this.events[event].apply(this, args);
        };
        this.innerWidth=200;
        this.innerHeight=400;
        this.outerWidth=210;
        this.outerHeight=440;
    }

    function constructFakeWindow() {

        return new FakeWindow();
    }

    function constructFakeContent() {
		return new Content(dummyNativeWindow);
    }

	function constructTopbar () {
		return new AppTopbar($('<div windowid="'+windowId+'"></div>'));
	}

    //endregion
});
