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

define(['settings'],function(settings) {
    function WindowOffsetDetector() {
        this.popupPointer = null;
        this.settings = settings;
    }

    WindowOffsetDetector.prototype.open = function() {
        this.popupPointer = window.open('/popup/load.html', 'loading', 'width=100,height=100');
        if(this.popupPointer === undefined) {
            throw new Error("cannot open window");
        }
    };


    WindowOffsetDetector.prototype.getScreenX = function() {
        return this.popupPointer.screenX;
    };

    WindowOffsetDetector.prototype.getScreenY = function() {
        return this.popupPointer.screenY;
    };

    WindowOffsetDetector.prototype._moveTo = function(x,y,cb) {

        var oldX = this.popupPointer.screenX;
        var oldY = this.popupPointer.screenY;
        var retries = 0;

        // outerHeight can't be equal to innerHeight
        // outerHeight and outerWidth can't be 0
        // Position can't be the original one
        var self = this;
        var timer = setInterval(function () {
            if ((self.popupPointer.screenX === oldX || self.popupPointer.screenY === oldY) ||
               (self.popupPointer.outerHeight === self.popupPointer.innerHeight) ||
               (self.popupPointer.outerHeight === 0 || self.popupPointer.innerHeight === 0)) {

                console.log("Window still moving: ", self.popupPointer.screenX,self.popupPointer.screenY,self.popupPointer.outerHeight, self.popupPointer.innerHeight);
                retries+=1;
                if (retries > self.settings.WINDOW_OFFSET_DETECTOR_MOVETO_MAX_RETRIES) {
                    console.error('WindowOffsetDetector: WARNING!!!: Too much retries waiting window to move', self.popupPointer);
                    clearInterval(timer);
                    cb(true); // Set to true due problems with eyerun under linux. Is supposed to be false
                }
                return;
            }

            clearInterval(timer);
            cb(true);

        },100);

        this.popupPointer.moveTo(x, y);

    };

    WindowOffsetDetector.prototype.moveToDetectDecoratorOffset = function(x ,y, cb) {
        var self = this;

        this._moveTo(x,y, function(result) {
            self._detectFinished(cb, x, y, result);
        });

    };

    WindowOffsetDetector.prototype._detectFinished = function(cb, x, y, result) {
        console.log('_detector: Detect finished: ', x, y, this.popupPointer.screenX, this.popupPointer.screenY);
        console.log('_detector: Detect finished: ', this.popupPointer.outerHeight, this.popupPointer.innerHeight);
        if (result) {
            cb(this.popupPointer.screenX - x, this.popupPointer.screenY - y);
        }
        this.popupPointer.close();
    };

    return WindowOffsetDetector;
});
