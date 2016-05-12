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
    'utils/emitter',
    'settings'
], function(Emitter, settings) {
    function NativeWindow(id, title, minWidth, minHeight, workspaceScreen, offsets, singleScreen, emitter, url) {
        this._id = id;
        this.x = null;
        this.y = null;
        this.width = null;
        this._screen = workspaceScreen;
        this.height = null;
        this.signals = emitter || new Emitter();
        this.vdiApp = null;
        this.title = title;
        this.shouldDoFocus = true;
        this.minWidth = minWidth;
        this.minHeight = minHeight;
        this._resizeTimer = null;
        this._moveInterval = null;
        this.visibilityInterval = null;
        this._currentMoveActions = null;
        this._offsets = offsets;
        this.outOfBoundaries = false;
        this.popupPointer = null;
        this.singleScreen = singleScreen;
		this.url = url || '/popup/';
        this.settings = settings;
        this._loading = true;
        this.type = '';
    }

    NativeWindow.VDI_WINDOW_TYPE = 'vdiWindow';

    NativeWindow.prototype.consoleLog = function() {

        if (this.settings.POPUP_WINDOW_DEBUG_LOG) {
            console.log.apply(console, arguments);
        }
    };

    NativeWindow.prototype.isInMasterScreen = function() {
        return this._screen.isIn(this.singleScreen, this.popupPointer.screen, this.popupPointer, this);
    };

    NativeWindow.prototype.getInternalPointer = function() {
        return this.popupPointer;
    };

    NativeWindow.prototype.appendDomElement = function(domElement) {
        this.popupPointer.document.body.appendChild(domElement[0]);
    };

    NativeWindow.prototype._initializeDependencies = function() {
        this.popupPointer.$ = $;
        this.popupPointer.DesktopBus = window.DesktopBus;
	    this.copyStylesToHead(this.popupPointer.document.head);
    };

    NativeWindow.prototype.addTopbar = function($compile, scope, tplFile) {
	    var self = this;
	    var templateFunc = $compile(tplFile);
	    var domElement = templateFunc(scope);
	    this.appendDomElement(domElement);
	    setTimeout(scope.$apply.bind(scope), 0);

	    scope.onClicked = function (e) {
		    e.stopPropagation();
		    self.signals.emit('popupFocused');
	    };
	    scope.$on('popup.appTopBarLoaded', function (event, topbar) {
		    self.signals.emit('appTopbarLoaded', topbar);
		    topbar.element.click(function (){
			    self.signals.emit('popupFocused');
		    });
	    });
    };

	NativeWindow.prototype.copyStylesToHead = function(head) {
		var $links = $('link'), link,
			$styles = $('style'), style;

		for(var i = 0; i < $links.length; i++) {
			link = document.createElement('link');
			link.rel = "stylesheet";
			link.href = $links[i].href;
			head.appendChild(link);
		}

		for(var j = 0; j < $styles.length; j++) {
			var aText = $($styles[j]).text();
			style = $('<style/>').text(aText);
			head.appendChild(style[0]);
		}
	};

    NativeWindow.prototype.isOutOfBoundaries = function() {
        return this.outOfBoundaries;
    };

    NativeWindow.prototype.displayMessage = function(data) {
        $(this.popupPointer.document.body).find('.msg-text')
            .before('<div class="msg-overlay"></div>')
            .append('<div class="' + data.cssClass + '">' + data.message + '</div>');
    };

    NativeWindow.prototype.removeMessage = function() {
        $(this.popupPointer.document.body).find('.msg-text').remove();
    };

    NativeWindow.prototype.focus = function() {
        this.popupPointer.focus();
    };

    NativeWindow.prototype.resizeTo = function(width, height) {
        this.popupPointer.resizeTo(width + this._offsets.outerWidthOffset, height + this._offsets.outerHeightOffset);
    };

    NativeWindow.prototype.resizeBy = function(width, height) {

        var self = this;
        var retries = 1;

        function check() {
            // While the browser is performing a resize, width and height are reported as 0 most of the time.
            if (self.popupPointer.outerHeight > 0 && self.popupPointer.outerWidth > 0) {
                self.popupPointer.resizeBy(width, height);
                return;
            }

            retries+=1;
            if (retries > settings.WINDOW_RESIZE_READY_MAX_RETRIES) {
                self.consoleLog('NativeWindow.ResizeBy: WARNING!!!! - Maximum retries reached - ', self.popupPointer);
                return;
            }

            setTimeout(check, 100);
        }

        check();

    };

    NativeWindow.prototype.close = function() {
        if(this.popupPointer) {
            this.popupPointer.close();
        }
    };

    NativeWindow.prototype.moveTo = function(x, y) {
        this.x = x;
        this.y = y;
        var pointerCoordinates = this._convertCoordinates(true);
        this.popupPointer.moveTo(pointerCoordinates.x, pointerCoordinates.y);
    };

    NativeWindow.prototype.getX = function() {
        return this.x;
    };

    NativeWindow.prototype.getY = function() {
        return this.y;
    };

    NativeWindow.prototype.setWidth = function(width) {
        this.width = width;
    };

    NativeWindow.prototype.setHeight = function(height) {
        this.height = height;
    };

    NativeWindow.prototype.getWidth = function() {
        return this.width;
    };

    NativeWindow.prototype.getHeight = function() {
        return this.height;
    };

    NativeWindow.prototype.getType = function() {
        return this.type;
    };

    NativeWindow.prototype.setType = function(type) {
        this.type = type;
    };

    NativeWindow.prototype.enableFocus = function(enable) {
        this.shouldDoFocus = enable;
    };

    NativeWindow.prototype.open = function(x, y, width, height, withRelativeCoordinates) {

        this._doOpen(x, y, width, height, withRelativeCoordinates);

    };

    NativeWindow.prototype._doOpen = function(x, y, width, height, withRelativeCoordinates) {
        var self = this;
        if(withRelativeCoordinates === undefined || withRelativeCoordinates === null) {
            withRelativeCoordinates = true;
        }
        self.x = x;
        self.y = y;
        self.width = width;
        self.height = height;
        var coordinates = self._convertCoordinates(withRelativeCoordinates);
        var winOptions = 'width=' + self.width + ',height=' + self.height + ',left=' + (coordinates.x - self._offsets.decoratorOffsetX) +
            ',top=' + (coordinates.y - self._offsets.decoratorOffsetY) +
            ',directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no';
        self.consoleLog(self._id, "opening popup with options", winOptions);
        self.popupPointer = self._constructWindow(winOptions);
        if(typeof self.popupPointer === 'undefined') {
            self._showPopupBlockerAlert();
            return;
        }
        if(coordinates.x+self.width < 0 || coordinates.y+self.height < 0) {

            self.outOfBoundaries = true;
            self.popupPointer.close();
        }
        if (self.popupPointer.screenX !== self.x || self.popupPointer.screenY !== self.y ) {
            self._moveEventReceived(self.popupPointer.screenX,self.popupPointer.screenY,true);
        }
        this._registerLoadHandler();
        this._registerUnloadHandler();
    };


    NativeWindow.prototype._constructWindow = function(winOptions) {
        return window.open(this.url + '?eyeWinId='+this._id, this._id, winOptions);
    };

    NativeWindow.prototype.setTitle = function(title) {
        this.title = title;
        this.popupPointer.document.title = title;
    };

    NativeWindow.prototype._registerListeners = function() {
        this._registerFocusHandler();
        this._registerResizeHandler();
        this._registerMoveEvent();
	    this._registerBlurEvent();
    };

	NativeWindow.prototype._registerBlurEvent = function() {
		var self = this;
		this.popupPointer.addEventListener('blur', function() {
			self.signals.emit("blur");
		});
	};

	NativeWindow.prototype._executePostCreationActions = function() {
    };

    NativeWindow.prototype._registerFocusHandler = function() {
        var self = this;
        this.popupPointer.addEventListener('focus', function() {
            if(self.shouldDoFocus) {
                self.performFocus();
                self.signals.emit('popupFocused');
            }
            self.shouldDoFocus = true;
        });
        this.popupPointer.addEventListener('click', function() {
            self.signals.emit('popupFocused');
        });
    };

    NativeWindow.prototype._registerResizeHandler = function() {
        var self = this;
        this.popupPointer.addEventListener('resize', function() {
            if(self._resizeTimer) {
                clearTimeout(self._resizeTimer);
            }
            self._resizeTimer = setTimeout(function(){
                var diffWidth = Math.abs(self.width - self.popupPointer.innerWidth);
                var diffHeight = Math.abs(self.height - self.popupPointer.innerHeight);
                //REVISAR
                self.consoleLog('EvenListener resize: Old width: ',self.width, 'new Width: ', self.popupPointer.innerWidth, 'Old Height: ', self.height, 'New Height:', self.popupPointer.innerHeight );
                if ( diffWidth === 0 && diffHeight === 0) {
                    self.consoleLog("NOT APPLYING RESIZE");
                    return;
                }
                self.signals.emit("cancelResizeResetPopupTimer");
                var winWidth = self.popupPointer.innerWidth;
                var winHeight = self.popupPointer.innerHeight;
                var outerWidth = self.popupPointer.outerWidth;
                var outerHeight = self.popupPointer.outerHeight;

                if( outerWidth < self.minWidth || outerHeight  < self.minHeight) {
                    var newWidth = Math.max(outerWidth, self.minWidth);
                    var newHeight = Math.max(outerHeight, self.minHeight);
                    self.popupPointer.resizeTo(newWidth, newHeight);
                } else {
                    self.width = winWidth;
                    self.height = winHeight;
                    self.signals.emit('popupResized', self.width, self.height);
                }
            }, 100);
        });
    };

    NativeWindow.prototype._registerLoadHandler = function() {

        var self = this;
        this._loading = true;

        this.popupPointer.addEventListener('load', function() {
            self.setTitle(self.title);
	        self._initializeDependencies();

            var hidden;
            if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
                hidden = "hidden";
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
            }

            self.signals.emit("popupMoved", self.getX(), self.getY());
            self.signals.emit("popupLoaded", this);

            self.performFocus();
            self._registerListeners();
            self._executePostCreationActions();
            self._loading = false;

        });
    };

    NativeWindow.prototype._registerUnloadHandler = function() {
        var self = this;
        this.popupPointer.addEventListener('beforeunload', function unload() {
            self.killAllTimers();
        });

        this.popupPointer.addEventListener('unload', function() {

            if (self._loading) {
                self.consoleLog('Popup loading. Ignoring unload');
                return;
            }

            var retries = 0;
            var closeTimer = setInterval(function() {
                if (self.popupPointer.closed) {
                    self.consoleLog('Popup closed.');
                    clearInterval(closeTimer);
                    self.signals.emit("popupUnloaded", true);
                    self.signals.emit("popupDestroyed");
                    return;
                }
                retries+=1;
                if (retries > settings.POPUP_WINDOW_CLOSED_DETECT_RETRIES) {
                    self.consoleLog('Popup reloaded.');
                    clearInterval(closeTimer);
                    self.signals.emit("popupUnloaded",false);
                    self.signals.emit("popupDestroyed");
                }
            },100);

        });
    };

    NativeWindow.prototype._showPopupBlockerAlert = function() {
        BootstrapDialog.show({
            message: 'Please disable your popup blocker!',
            buttons: [{
                label: 'OK',
                action: function (dialog) {
                    dialog.close();
                }
            }]
        });
    };

    NativeWindow.prototype.performFocus = function() {
        if(this.type === NativeWindow.VDI_WINDOW_TYPE) {

            var inputManager = this.popupPointer.document.getElementById('inputmanager');
            if (inputManager) {
                inputManager.focus();
            }
        }
    };

    NativeWindow.prototype._moveEventReceived = function(x, y, isMoving) {
        if(isMoving) {
            this._currentMoveActions = {xPos:x, yPos:y};
        } else {
            if(this._currentMoveActions) {
                this.consoleLog("SENDING MOVE", this._currentMoveActions);
                this.x = this._currentMoveActions.xPos - this._screen.getX();
                this.y = this._currentMoveActions.yPos - this._screen.getY();
                this.signals.emit("popupMoved", this._currentMoveActions.xPos, this._currentMoveActions.yPos);
                this._currentMoveActions = null;
            }
        }
    };

    NativeWindow.prototype._registerMoveEvent = function() {
        var oldX = this.popupPointer.screenX,
            oldY = this.popupPointer.screenY;
        var self = this;
        this._moveInterval = setInterval(function() {
            //when closing a popup screenX and Y turns to 0 for a moment and this will be detected as move event
            //we use location origin to check if popup is closing, FRAGILE
            if(oldX !== self.popupPointer.screenX || oldY !== self.popupPointer.screenY){
                if (self.popupPointer.location.origin) {
                    self._moveEventReceived(self.popupPointer.screenX, self.popupPointer.screenY, true);
                }
            } else {
                self._moveEventReceived(self.popupPointer.screenX, self.popupPointer.screenY, false);
            }
            oldX = self.popupPointer.screenX;
            oldY = self.popupPointer.screenY;
        }, 100);
    };

    NativeWindow.prototype._convertCoordinates = function(withRelativeCoordinates) {
        var x = this.x;
        var y = this.y;
        if(withRelativeCoordinates) {
            x += this._offsets.getScreenX();
            y += this._offsets.getScreenY();
        }
        return {x: x, y: y};
    };

    NativeWindow.prototype.killAllTimers = function() {
        if(this._moveInterval) {
            clearInterval(this._moveInterval);
        }
        if(this.visibilityInterval) {
            clearInterval(this.visibilityInterval);
        }
        if(this._resizeTimer) {
            clearTimeout(this._resizeTimer);
        }
    };

    return NativeWindow;
});
