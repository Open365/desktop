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
    'windows/newPopupWindow/nativeWindow',
    'windows/newPopupWindow/screen',
    'windows/newPopupWindow/popupWindowOffsets',
    'utils/emitter',
    'settings'
], function(NativeWindow, Screen, PopupWindowOffsets, Emitter, settings) {
    var sut, dummyScreen, dummyOffsets, dummyEmitter;
    var testId = "testId";
    var testTitle = "testTitle";
    var singleScreen = true;
    var testOuterWidthOffset = 10;
    var testOuterHeightOffset = 20;
    var testScreenXOffset = 10;
    var testScreenYOffset = 20;
    var testDecoratorOffsetX = 4;
    var testDecoratorOffsetY = 15;
    var testX = 10;
    var testY = 20;
    var testWidth = 100;
    var testHeight = 200;
    var fakeWindow = null;
    var fakeDomElement = [{}];
    var oldWindow = window;
    var visibilityStatus = true;
    var clock = null;
    var minWidth=5;
    var minHeight=10;

    suite('NativeWindow', function() {
        setup(function() {
            fakeWindow = constructFakeWindow();
            oldWindow = window.eyeosVdiClient;
            prepareWindow();
            constructSut();
            clock = sinon.useFakeTimers();
        });

        teardown(function() {
            window.eyeosVdiClient = oldWindow;
            clock.restore();
        });

        test("isInMasterScreen should call screen isIn", sinon.test(function() {
            this.mock(dummyScreen).expects("isIn").once().withExactArgs(singleScreen, fakeWindow.screen, fakeWindow, sut);
            sut.isInMasterScreen();
        }));

        test("isInMasterScreen should return result from screen isIn", sinon.test(function() {
            var isInScreen = true;
            this.stub(dummyScreen, "isIn", function() {
                return isInScreen;
            });
            var actual = sut.isInMasterScreen();
            assert.equal(isInScreen, actual);
        }));

        test("appendDomElement with a jQuery DomElement should call to body appendChild with the firstElement", sinon.test(function(){
            this.mock(fakeWindow.document.body).expects("appendChild").once().withExactArgs(fakeDomElement[0]);
            sut.appendDomElement(fakeDomElement);
        }));

        test("focus should call pointer focus", sinon.test(function() {
            this.mock(fakeWindow).expects("focus").once();
            sut.focus();
        }));

        test("resizeTo should call to pointer resizeTo with width and height recalculated with offsets", sinon.test(function() {
            var width = 10;
            var height = 20;
            var expectedWidth = width + testOuterWidthOffset;
            var expectedHeight = height + testOuterHeightOffset;
            this.mock(fakeWindow).expects("resizeTo").once().withExactArgs(expectedWidth, expectedHeight);
            sut.resizeTo(width, height);
        }));

        test("resizeBy when popup is ready should call to pointer resizeBy with width and height", sinon.test(function() {
            var width = 10;
            var height = 20;
            this.stub(fakeWindow, 'resizeBy');
            sut.resizeBy(width, height);
            assert(fakeWindow.resizeBy.calledWithExactly(width, height));
        }));

        test("resizeBy when popup is not ready should not call to pointer resizeBy with width and height", function() {
            var width = 10;
            var height = 20;
            fakeWindow.outerHeight = 0;
            fakeWindow.outerWidth = 0;
            sinon.stub(fakeWindow, 'resizeBy');
            sut.resizeBy(width, height);
            clock.tick((settings.WINDOW_RESIZE_READY_MAX_RETRIES - 1 ) * 100);
            sinon.assert.notCalled(fakeWindow.resizeBy);
        });


        test("close should call to pointer close", sinon.test(function() {
            this.mock(fakeWindow).expects("close").once();
            sut.close();
        }));

        test("moveTo should call to pointer moveTo recalculated with offsets", sinon.test(function() {
            var x = 30;
            var y = 40;
            var expectedX = x + testScreenXOffset;
            var expectedY = y + testScreenYOffset;
            configurePositionOffsetsAsStub(testScreenXOffset, testScreenYOffset, this);
            this.mock(fakeWindow).expects("moveTo").once().withExactArgs(expectedX, expectedY);
            sut.moveTo(x, y);
        }));

        test("open withRelativesCoordinates should construct pointer with correct data", sinon.test(function() {
            configurePositionOffsetsAsStub(testScreenXOffset, testScreenYOffset, this);
            var correctedX= testX + testScreenXOffset;
            var correctedY= testY + testScreenYOffset;
            this.mock(sut).expects("_constructWindow").once().withExactArgs(getExpectedWinOptions(correctedX, correctedY));
            exerciseOpen(true);
        }));

        test("open without relativeCoordinates should construct pointer with correct data", sinon.test(function() {
            this.mock(sut).expects("_constructWindow").once().withExactArgs(getExpectedWinOptions(testX, testY));
            exerciseOpen(false);
        }));

        test("open if resulting x plus width is less than zero should call to pointer close", sinon.test(function(){
            var x = -2;
            var width = -1;
            this.mock(fakeWindow).expects("close").once();
            exerciseOpen(false, x, 0, width, 0);
        }));

        test("open if resulting x plus width is less than zero will set OutOfBoundaries to true", function() {
            //guard assertion
            assert.isFalse(sut.isOutOfBoundaries());
            var x = -2;
            var width = -1;
            exerciseOpen(false, x, 0, width, 0);
            assert.isTrue(sut.isOutOfBoundaries());
        });

        test("open if resulting y plus height is less than zero should call to pointer close", sinon.test(function() {
            var y = -2;
            var height = -1;
            this.mock(fakeWindow).expects("close").once();
            exerciseOpen(false, 0, y, 0, height);
        }));

        test("open if resulting y plus height is less than zero will set OutOfBoundaries to true", function() {
            //guard assertion
            assert.isFalse(sut.isOutOfBoundaries());
            var y = -2;
            var height = -1;
            exerciseOpen(false, 0, y, 0, height);
            assert.isTrue(sut.isOutOfBoundaries());
        });

        suite("NativeWindow Listeners", function(){

            setup(function () {
                this.originalEyethemeName = settings.EYETHEME_NAME;
                settings.EYETHEME_NAME = 'workspacev2';
            });

            test("load event should set the document title to the native window title", function() {
                var newTitle = "new Title";
                sut.title= newTitle;
                //GUARD ASSERTION
                assert.equal(undefined, fakeWindow.document.title);
                triggerEvent("load");
                assert.equal(newTitle, fakeWindow.document.title);
            });

            test("load event should emit event popupLoaded", function() {
                sinon.spy(dummyEmitter, "emit");
                triggerEvent("load");
                assert.deepEqual(['popupMoved', testX,testY], dummyEmitter.emit.getCall(0).args);
                assert.deepEqual(['popupLoaded', fakeWindow], dummyEmitter.emit.getCall(1).args);
            });

            suite('load event', function(){
                var originalDesktopBus;
                setup(function () {
	                sinon.stub(sut, 'copyStylesToHead');
                    originalDesktopBus = window.DesktopBus;
                    window.DesktopBus = 'fakeDesktopBus';
                });
                teardown(function(){
	                sut.copyStylesToHead.restore();
                    window.DesktopBus = originalDesktopBus
                });

                function exercise () {
                    triggerEvent("load");
                }

                test('should add jquery to new window', sinon.test(function(){
                    exercise();
                    assert.equal(fakeWindow.$, $);
                }));

                test('should add desktopBus to new window', sinon.test(function(){
                    exercise();
                    assert.equal(fakeWindow.DesktopBus, window.DesktopBus);
                }));

                test('should append styles from desktop window to popup window', sinon.test(function(){
                    sinon.stub(fakeWindow.document.head, 'appendChild');
                    exercise();
                    assert(sut.copyStylesToHead.calledWith(fakeWindow.document.head), 'Not added styles to popup head tag');
                }));
            });

            test("unload event when loading a popup should not emit any signal", function() {
                sinon.spy(dummyEmitter, "emit");
                triggerEvent("unload");
                assert.deepEqual(null, dummyEmitter.emit.getCall(0));
            });

            test("unload event from reload a popup should emit event popupUnloaded with a false flag", function() {
                sinon.spy(dummyEmitter, "emit");
                exerciseOpen(false, testX, testY, testWidth, testHeight);
                sut._loading = false;
                fakeWindow.triggerEvent("unload");
                clock.tick((settings.POPUP_WINDOW_CLOSED_DETECT_RETRIES+1)*100);
                assert.deepEqual(['popupUnloaded',false], dummyEmitter.emit.getCall(0).args);
            });

            test("unload event from closing a popup should emit event popupUnloaded with a true flag", function() {
                sinon.spy(dummyEmitter, "emit");
                exerciseOpen(false, testX, testY, testWidth, testHeight);
                sut._loading = false;
                sut.popupPointer.closed = true;
                fakeWindow.triggerEvent("unload");
                clock.tick(100);
                assert.deepEqual(['popupUnloaded',true], dummyEmitter.emit.getCall(0).args);
            });

            test("focus when shouldDoFocus setted to true should emit event popupFocused", function() {
                triggerEvent("load");
                sinon.spy(dummyEmitter, "emit");
                sut.shouldDoFocus = true;
                //GUARD ASSERTION
                assert.equal(0, dummyEmitter.emit.getCalls().length);
                triggerEvent("focus");
                assert.equal(1, dummyEmitter.emit.getCalls().length);
                assert.deepEqual(['popupFocused'], dummyEmitter.emit.getCall(0).args);
            });

            test("focus when shouldDoFocus setted to false will never emit event popupFocused", function() {
                triggerEvent("load");
                sinon.spy(dummyEmitter, "emit");
                sut.shouldDoFocus = false;
                //GUARD ASSERTION
                assert.equal(0, dummyEmitter.emit.getCalls().length);
                triggerEvent("focus");
                assert.equal(0, dummyEmitter.emit.getCalls().length);
            });

            test("focus when shouldDoFocus setted to false will set shouldDoFocus to true", function() {
                triggerEvent("load");
                sut.shouldDoFocus = false;
                triggerEvent("focus");
                assert.isTrue(sut.shouldDoFocus);
            });

            test("resize when called and newSize and oldSize is not same should emit cancelResizeResetPopupTimer", function() {
                triggerEvent("load");
                sinon.spy(dummyEmitter, "emit");
                triggerEvent("resize");
                clock.tick(100);
                assert.deepEqual(['cancelResizeResetPopupTimer'], dummyEmitter.emit.getCall(1).args);
            });

            test("resize when called and newSize and oldSize is not same and height and width are greater than minimum size should call to popupResized with correct data", function() {
                triggerEvent("load");
                sinon.spy(dummyEmitter, "emit");
                triggerEvent("resize");
                clock.tick(100);
                assert.equal(3, dummyEmitter.emit.getCalls().length);
                assert.deepEqual(['popupResized', 200, 400], dummyEmitter.emit.getCall(2).args);
            });

            test("resize when called and newSize and oldSize is not same and height and width are minor thant the minimum size should never call to popupResized", function() {
                triggerEvent("load");
                sinon.spy(dummyEmitter, "emit");
                fakeWindow.outerWidth = minWidth - 1;
                fakeWindow.outerHeight = minHeight - 1;
                triggerEvent("resize");
                clock.tick(100);
                assert.equal(2, dummyEmitter.emit.getCalls().length);
            });

            test("resize when called and newSize and oldSize is not same and height and width are minor thant the minimum size should call popupPointer resize to minWidth and minHeight", function() {
                triggerEvent("load");
                fakeWindow.outerWidth = minWidth - 1;
                fakeWindow.outerHeight = minHeight - 1;
                sinon.mock(fakeWindow).expects("resizeTo").once().withExactArgs(minWidth, minHeight);
                triggerEvent("resize");
                clock.tick(100);
            });

            teardown(function () {
                settings.EYETHEME_NAME = this.originalEyethemeName;
            });

        });

		suite('addTopbar', function(){
			var compileStub, compileWithScopeStub,
				fakeTemplateFile, fakeScope,
				appTopbarDomElement;

			setup(function () {
				appTopbarDomElement = $('<div class="appTopbar"></div>');
				compileWithScopeStub = sinon.stub().returns(appTopbarDomElement);
				compileStub = sinon.stub().returns(compileWithScopeStub);
				fakeScope = {
					$apply: sinon.stub(),
					$on: sinon.stub()
				};
				fakeTemplateFile = 'aFakeTemplate';
			});

			function exercise () {
				return sut.addTopbar(compileStub, fakeScope, fakeTemplateFile);
			}

		    test('should compile an applicationTopbar template ', sinon.test(function(){
			    exercise();
			    assert(compileStub.calledWithExactly(fakeTemplateFile), "addTopbar: compile not called");
		    }));
			
		    test('should link the template with passed scope', sinon.test(function(){
			    exercise();
			    assert(compileWithScopeStub.calledWithExactly(fakeScope), "addTopbar: link not called");
		    }));
			
			test('should append the generated template into the popup', sinon.test(function(){
				this.stub(fakeWindow.document.body, 'appendChild');
				exercise();
				assert(fakeWindow.document.body.appendChild.calledWith(appTopbarDomElement[0]), 'topbar not appended')
			}));

			test('should apply changes into view', sinon.test(function () {
                try {
                    var clock = sinon.useFakeTimers();
                    exercise();
                    clock.tick(1);
                    assert(fakeScope.$apply.calledWith(), 'scope.$apply not called');
                }finally {
                    clock.restore();
                }

			}));

			suite('on appTopbarLoaded event', function () {
				var fakeTopbar;
				setup(function () {
					sinon.spy(sut, "resizeBy");
					sinon.spy(dummyEmitter, "emit");
					fakeTopbar = {
						getHeight: sinon.stub(),
                        element: {
                            click: sinon.stub()
                        }
					};
					fakeScope.$on.callsArgWith(1, 'anEvent', fakeTopbar);
				});

				teardown(function () {
					dummyEmitter.emit.restore();
				});

				test('should emit signal notifying appTopbarLoaded', sinon.test(function () {
					exercise();
					assert(dummyEmitter.emit.calledWithExactly('appTopbarLoaded', fakeTopbar), 'Signal appTopbarLoaded not emited');
				}));

                test("should call click on topbar element", function () {
                    exercise();
                    sinon.assert.calledWithExactly(fakeTopbar.element.click, sinon.match.func);
                });
            });

		});


    });

    //region testutilities

    function setUpAndExerciseVisibilityChange() {
        sinon.spy(dummyEmitter, "emit");
        triggerEvent("load");
        clock.tick(100);
        assert.deepEqual(['popupVisibilityChange', visibilityStatus], dummyEmitter.emit.getCall(1).args);
    }

    function triggerEvent(event, args) {
        exerciseOpen(false, testX, testY, testWidth, testHeight);
        fakeWindow.triggerEvent(event, args);
    }

    function getExpectedWinOptions(x, y) {
        return 'width=' + testWidth + ',height=' + testHeight + ',left=' + (x - testDecoratorOffsetX) +
            ',top=' + (y - testDecoratorOffsetY) +
            ',directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no';
    }


    function exerciseOpen(withRelativeCoordinates, x, y, width, height) {
        var finalX = x !== undefined ? x : testX;
        var finalY = y !== undefined ? y : testY;
        var finalWidth = width !== undefined ? width : testWidth;
        var finalHeight = height !== undefined ? height : testHeight;
        sut._doOpen(finalX, finalY, finalWidth, finalHeight, withRelativeCoordinates);
    }

    function configurePositionOffsetsAsStub(x, y, context) {
        context.stub(dummyOffsets, "getScreenX", function() {
            return x;
        });

        context.stub(dummyOffsets, "getScreenY", function() {
            return y;
        });
    }

    function constructSut(ConcreteWindow) {
	    ConcreteWindow = ConcreteWindow || NativeWindow;

        dummyEmitter = new Emitter();
        dummyOffsets = new PopupWindowOffsets();
        dummyOffsets.outerWidthOffset = testOuterWidthOffset;
        dummyOffsets.outerHeightOffset = testOuterHeightOffset;
        dummyOffsets.decoratorOffsetX = testDecoratorOffsetX;
        dummyOffsets.decoratorOffsetY = testDecoratorOffsetY;
        dummyScreen = new Screen(dummyOffsets);
        sut = new ConcreteWindow(testId, testTitle, minWidth, minHeight, dummyScreen, dummyOffsets, singleScreen, dummyEmitter);
        sut.popupPointer = fakeWindow;
        sut._constructWindow = function() {
            return fakeWindow;
        };
	    return sut;
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
            head: {
                appendChild: function () {}
            },
            getElementById: function(){}
        };
        this.events = {};
        this.focus = function(){};
        this.resizeTo = function(){};
        this.resizeBy = function(){};
        this.close = function(){};
        this.moveTo = function(){};
        this.addEventListener = function (event, fp){
            this.events[event] = fp;
        };
        this.triggerEvent = function(event, args){
            this.events[event].apply(this, args);
        };
        this.screenX = 0;
        this.screenY = 0;
        this.innerWidth=200;
        this.innerHeight=400;
        this.outerWidth=210;
        this.outerHeight=440;
    }

    function constructFakeWindow() {

        return new FakeWindow();
    }
    //endregion

	return {
		'constructSut': constructSut,
		'exerciseOpen': exerciseOpen,
		'prepareWindow': prepareWindow,
        'triggerEvent': triggerEvent
	}
});
