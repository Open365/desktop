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
    'utils/emitter',
    'windows/newPopupWindow/screen',
    'windows/newPopupWindow/internalWindowFactory',
    'windows/newPopupWindow/components/content',
    'windows/newPopupWindow/appTopbar/appTopbarElem',
    'windows/focusDetector',
	'settings'
], function(Emitter, Screen, internalWindowFactory, Content, AppTopbar, FocusDetector, settings) {

    function PopupWindow(options, popupWindowOffsets, popupWindowRegistry, emitter, customSettings) {
        this._options = options;
	    this.isVdiWindow = null;
	    this.outOfControl = false;
	    this.$content = { height: function(height) {}}; // silly contract compatibility
	    this.preventCloseEvent = 1;
	    this.signals = emitter || new Emitter();
	    this.popupWindowOffsets = popupWindowOffsets;
	    this.id = null;
	    this.popupWindowRegistry = popupWindowRegistry;
        this._isHidden = false;
        this.shouldDoFocus = true;
        this._cancelResizeTimer = [];
        this._readyCallback = null;
        this.singleScreen = false;
        this.unclosable = false;
        this.topbar = new AppTopbar(null);
        this.settings = customSettings || settings;
        this._opening = true;
    }

    PopupWindow.windowsWithoutToolbar = [
        "#32770",
        "NUIDialog",
        "MsoSplash",
        "eyeosNoTopbar"
    ];

    PopupWindow.prototype.consoleLog = function() {
        if (this.settings.POPUP_WINDOW_DEBUG_LOG) {
            console.log.apply(console, arguments);
        }
    };

    PopupWindow.prototype.getId = function () {
        return this.id;
    };

    PopupWindow.prototype.setSingleScreen = function(singleScreen) {
        this.singleScreen = singleScreen;
    };

    PopupWindow.prototype.setUnclosable = function(unclosable) {
        this.unclosable = unclosable;
    };

    PopupWindow.prototype.getPopupPointer = function() {
        return this.popupPointer.getInternalPointer();
    };

    PopupWindow.prototype.appendDomElement = function(domElement) {
        this.popupPointer.appendDomElement(domElement);
    };

    PopupWindow.prototype.getX = function() {
        return this.popupPointer.getX();
    };

    PopupWindow.prototype.getY = function() {
        return this.popupPointer.getY();
    };


    PopupWindow.prototype.get$content = function() {
        return this.$content;
    };

    PopupWindow.prototype.getTopbar = function() {
        return this.topbar;
    };


    PopupWindow.prototype.getSignals = function() {
        return this.signals;
    };


    PopupWindow.prototype.setReadyCallBack = function(fp){
        this._readyCallback = fp;
    };

    PopupWindow.prototype.closeSilent = function(){
        this.preventCloseEvent = 1;
        this.popupPointer.close();
    };

    PopupWindow.prototype.close = function() {
        this.unclosable = false;
        var self = this;
        var retries = 0;
        var timer = setInterval(function() {
            if (!self._opening || retries > 5) {
                clearInterval(timer);
                self.popupPointer.close();
            }
            retries+=1;
        },10);

    };


    PopupWindow.prototype.move = function(x, y) {
        if(this.popupPointer.getX() !== x || this.popupPointer.getY() !== y) {
            if(this.getOutOfControl() || this.getOutOfBoundaries()) {
                this.signals.emit('resetPopup', true);
            } else {
                this.popupPointer.moveTo(x, y);
            }
        } else {
            this.consoleLog("SAME POSITION DO NOT MOVE");
        }
    };

    PopupWindow.prototype.resizeContent = function(width, height) {

        this.consoleLog('resizeContent. Function called. Args:  width: ', width, ', Height: ', height);

        if (this.resizeTimer) {
            this.consoleLog('Clearing resizeTimer Interval (', this.resizeRetries, ' retries )');
            clearInterval(this.resizeTimer);
            this.resizeTimer = null;
        }

        var sizeRestricted = false;
        var maxHeight = screen.availHeight-this.topbar.getHeight();
        var maxWidth = screen.availWidth-this.popupWindowOffsets.outerWidthOffset;


        if ( width === screen.availWidth) {
            maxWidth = width;
        }
        this.consoleLog('resizeContent: Maxwidth:', maxWidth, 'offset: ', this.popupWindowOffsets.outerWidthOffset);
        this.consoleLog('resizeContent: Aval Width: ', screen.availWidth, 'Offset: ',this.popupWindowOffsets.outerWidthOffset);
        this.consoleLog('resizeContent: Aval Height: ', screen.availHeight, 'Offsets: ',this.popupWindowOffsets.outerHeightOffset, 'toolbar', this.topbar.getHeight() );


        if (width > maxWidth) {
            this.consoleLog('VDI Window too big, forcing width to: ', maxWidth, ' Width received: ', width);
            width = maxWidth;
            sizeRestricted = true;
        }

        if (height > maxHeight) {
            this.consoleLog('VDI Window too big, forcing height to: ', maxHeight, ' Height received: ', height);
            height = maxHeight;
            sizeRestricted = true;
        }

        if(!this.popupPointer.isInMasterScreen()) {
            this.consoleLog("Not Master screen reseting");
        }

        if(this.$content.width() !== width || this.$content.height() !== height || sizeRestricted) {
            this.consoleLog('ResizeContent: ', this.$content.width(), width, this.$content.height(), height, sizeRestricted);
            this.$content.width(width);
	        this.$content.height(height);

            if (sizeRestricted) {
                this.consoleLog('SizeRestricted: Emiting resize to mswin: ', width, height);
                this.signals.emit('resize', this);
            } else {
                this.popupPointer.resizeTo(width, height + this.topbar.getHeight());
            }
        } else {
            this.consoleLog("ResizeContent: SAME SIZE DO NOTHING");
        }
    };

    PopupWindow.prototype.minimize = function() {
        if(!this._isHidden) {
            this.signals.emit('restore', this);
        }
    };

    PopupWindow.prototype.maximize = function() {
        this.consoleLog("Maximize not allowed. Restoring window");
        this.signals.emit('restore', this);
    };

    PopupWindow.prototype.focus = function() {
        this.popupPointer.focus();
    };

    PopupWindow.prototype.getIsVdiWindow = function() {
        return this.isVdiWindow;
    };

    PopupWindow.prototype.enableFocus = function(enable) {
        this.shouldDoFocus = enable;
    };

    PopupWindow.prototype.displayMessage = function(data) {
        this.popupPointer.displayMessage(data);
    };

    PopupWindow.prototype.open = function(withRelativesCoordinates, isResettingPopup) {
        var self = this;
        this._opening = true;
        this.id = "winname-" + this._makeId();

        var popupPointer = internalWindowFactory.getWindow(
			this.id,
			this._options.title,
			this._options.minWidth,
			this._options.minHeight,
			new Screen(this.popupWindowOffsets),
			this.popupWindowOffsets,
			this.singleScreen,
			null,
			this._options.url
		);

        var isVdi = this._options.appData.isVdi;
        if(isVdi){
            popupPointer.setType(popupPointer.constructor.VDI_WINDOW_TYPE);
        }

        popupPointer.open(self._options.x, self._options.y, self._options.width, self._options.height, withRelativesCoordinates);

        self.$content = $(popupPointer.getInternalPointer());
        self.popupPointer = popupPointer;

        if (!self.popupPointer.isOutOfBoundaries()) {
            self._setWindowListeners(isResettingPopup);
        }

    };

    PopupWindow.prototype.setWindowReady = function(domElement) {
        this._domElement = domElement;
        this.detectVDIWindow(this._domElement);
    };

    PopupWindow.prototype.resetPopup = function() {

        if(this.isVdiWindow) {
            this.consoleLog("VDI, RESETTING", this.popupPointer.getX(), this.popupPointer.getY());
            this.preventCloseEvent = 1;
            var self = this;
            this._options.x = this.popupPointer.getX();
            this._options.y = this.popupPointer.getY();

            //HACK: Add a pixel to force a resize and reload the canvas

            this._options.width = this.popupPointer.getWidth() + 1;
            this._options.height = this.popupPointer.getHeight() - this.topbar.getHeight();
            this.popupPointer.signals.on('popupDestroyed', function() {
                self.open(true, true);
            });
            this.popupPointer.close();
        } else {
            this.consoleLog("NON VDI, NON RESETTING");
        }
    };


    PopupWindow.prototype.removeMessage = function() {
        this.popupPointer.removeMessage();
    };

    PopupWindow.prototype.replaceContent = function(domElement) {
        this.$content = new Content(domElement, this.$content.width(), this.$content.height());
        this._domElement.remove();
        this._domElement = domElement;
        this.popupPointer.appendDomElement(domElement);
    };

    PopupWindow.prototype.setHidden = function(hidden) {
        if(hidden !== this._isHidden) {
            this._isHidden = hidden;
            if(hidden) {
                this.consoleLog("MINIMIZE");
                this.signals.emit('minimize', this);
            } else {
                this.consoleLog("RESTORE");
                this.signals.emit('restore', this);
            }
        }
    };

    PopupWindow.prototype._performMove = function(x, y) {
        var self = this;

        self.signals.emit('move');

        if(this.popupPointer.isInMasterScreen()) {
            self.consoleLog("IN MASTER SCREEN");
            self.setOutOfControl(false);
        } else {
            self.consoleLog("IN ALTERNATIVE");
            self.setOutOfControl(true);
        }
    };

    PopupWindow.prototype._killCancelResizeInterval = function() {
        var self = this;
        while(self._cancelResizeTimer.length) {
            var timer = self._cancelResizeTimer.pop();
            clearTimeout(timer);
        }
    };

    PopupWindow.prototype._makeId = function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    };


    PopupWindow.prototype._setWindowListeners = function(resettingPopup) {
        var self = this;
        if (!resettingPopup) {
            this.signals.on('resetPopup', this.resetPopup.bind(this));
            this.signals.on('close', function () {
                self.signals.emit("closeDone");
                if (!self.unclosable) {
                    self.popupWindowRegistry.popupClosed(self);
                }
            });
            this.signals.on('focus', function() {
                self.popupWindowRegistry.moveToTop(self);
            });
            this.popupWindowRegistry.popupOpened(this);
        }
        this.setPopupPointerListeners();
    };

	PopupWindow.prototype.detectVDIWindow = function(content) {
		var childrens = content.children();

        if (childrens.length === 2 && childrens[0].tagName === 'CANVAS' && childrens[1].tagName === 'CANVAS') {
            this.isVdiWindow = true;
            return;
        }

		this.isVdiWindow = false;
	};


	PopupWindow.prototype.setOutOfControl = function(out) {
		this.outOfControl = out;
	};


    PopupWindow.prototype.getOutOfControl = function() {
        return this.outOfControl;
    };

	PopupWindow.prototype.getOutOfBoundaries = function() {
        this.consoleLog('getOutOfBoundaries: ', this.popupPointer.isOutOfBoundaries());
		return this.popupPointer.isOutOfBoundaries();
	};

    PopupWindow.prototype.setPopupPointerListeners = function() {
        var self = this;

        this.popupPointer.signals.on("popupFocused", function() {
            self.signals.emit('focus');
        });

        this.popupPointer.signals.on("blur", function() {
            self.signals.emit('blur');
        });

        this.popupPointer.signals.on("cancelResizeResetPopupTimer", function() {
            self._killCancelResizeInterval();
        });

        this.popupPointer.signals.on("popupResized", function(winWidth, winHeight) {

            if (self.resizeTimer) {
                self.consoleLog('Resize in progress. Ignoring new resize');
                // set native popup back to the previous size
                self.popupPointer.resizeTo(self.$content.width(), self.$content.height() + self.topbar.getHeight());
                return;
            }

            var oldWidth = self.$content.width();
            var oldHeight = self.$content.height() + self.topbar.getHeight();

            self.consoleLog('On PopupResized: ', oldWidth, oldHeight, 'New values: ', winWidth, winHeight);
            self.$content.width(self.popupPointer.getWidth());
	        self.$content.height(self.popupPointer.getHeight() - self.topbar.getHeight());
            winHeight -= self.topbar.getHeight();
            if (winWidth === screen.availWidth) {
                winWidth -= self.popupWindowOffsets.outerWidthOffset;
            }

            self.consoleLog('On PopupResized: Sending new size to mswin: ', winWidth, winHeight, "innerHeight: ", self.popupPointer.getHeight(), "topbar Height: ", self.topbar.getHeight());
            self.signals.emit('resize', self);

            if (self.isVdiWindow) {

                self.resizeRetries = 0;
                self.resizeTimer = setInterval(function() {
                    self.resizeRetries+=1;
                    if (self.resizeRetries > settings.POPUP_WINDOW_RESIZED_RETRIES) {
                        clearInterval(self.resizeTimer);
                        self.resizeTimer = null;
                        self.consoleLog('on PopupResized: Windows doesn\'t emited resize event. Reverting popup resize' );
                        self.popupPointer.resizeTo(oldWidth, oldHeight);
                        self.$content.width(oldWidth);
                        self.$content.height(oldHeight - self.topbar.getHeight());
                    }
                },100);
                self.consoleLog('popupResized. Init timer: ', self.resizeTimer);

            }

        });

        this.popupPointer.signals.on("popupLoaded", function(nativePopupPointer) {
            self.preventCloseEvent = 0;
            var tmpl;
            var $scope = self._options.$scope;

            if(self.settings.POPUP_WINDOW_TOPBAR_ACTIVE) {
                $scope.hasAttach = !self.isVdiWindow && settings.DETACH_WINDOW_ACTIVE;
                $scope.desktopClick = function () {
                    window.setTimeout(function () {
                        $(document.body).click();
                    }, 0);
                };
                if($.inArray(self._options.className, PopupWindow.windowsWithoutToolbar) === -1) {
                    tmpl = '<div ng-click="desktopClick()" ng-include="\'' + $scope.hooks.popupTopbar + '\'" '
                        + ' app-topbar-directive windowId="' + self.id + '"></div>';
                    self.popupPointer.addTopbar(self._options.$compile, $scope, tmpl);
                } else {
                    tmpl = '<div ng-click="desktopClick()" ng-include="\'' + $scope.hooks.emptyPopupTopbar + '\'" '
                        + ' app-topbar-directive windowId="' + self.id + '"></div>';
                    self.popupPointer.addTopbar(self._options.$compile, $scope, tmpl);
                }
	        }

            self.$content = new Content(self._domElement, self._options.width, self._options.height);
	        self.appendDomElement(self._domElement);
            if(self._readyCallback) {
                self._readyCallback(self._domElement);
            }

            var focusDetector = FocusDetector.getInstance();
            focusDetector.registerWindow(nativePopupPointer, 'popup');
            self._opening = false;
        });

        this.popupPointer.signals.on("popupMoved", self._performMove, self);

        this.popupPointer.signals.on("popupUnloaded", function(closed) {

            if (!self.preventCloseEvent) {

                if(self.unclosable) {
                    self.signals.emit('resetPopup', true);
                }

                if ( closed && !self.getOutOfBoundaries()) {
                        self.signals.emit('close');
                }
            }
            self._killCancelResizeInterval();
        });

	    function appTopbarLoadedHandler (topbar) {
		    if(topbar.getId() === self.id){
			    self.topbar = topbar;
                self.popupPointer.resizeBy(0, topbar.getHeight());
			    self.popupPointer.signals.off("appTopbarLoaded", appTopbarLoadedHandler, self);
		    }
	    }

        this.popupPointer.signals.on("appTopbarLoaded", appTopbarLoadedHandler, self);

        this.popupPointer.signals.on("popupVisibilityChange", function(visible) {
            self.setHidden(visible);
        });
    };


    return PopupWindow;
});
