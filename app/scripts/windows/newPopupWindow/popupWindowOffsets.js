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
    "windows/newPopupWindow/windowOffsetDetector",
    "settings"
], function (WindowOffsetDetector,settings) {

    function PopupWindowOffsets(windowOffsetdetector) {
        this.screenX = 0;
        this.screenY = 0;
        this.decoratorOffsetX = 0;
        this.decoratorOffsetY = 0;
        this.outerWidthOffset = 0;
        this.outerHeightOffset = 0;
        this.detectStatus = this.detectionStates.UNDETECTED;
        this.detected = false;
        this._detector = windowOffsetdetector || new WindowOffsetDetector();
    }

    PopupWindowOffsets.prototype.detectionStates = {
        UNDETECTED : 0,
        INPROGRESS: 1,
        DETECTED: 2
    };

    PopupWindowOffsets.prototype.detectOnlyOnce = function (cb) {

        var self = this;
         if (!this.detectStatus) {
             this.detectStatus = this.detectionStates.INPROGRESS;
             this.detect(null , null, function() {
                self.detectStatus = self.detectionStates.DETECTED;
                cb();
             });
         } else {
            var retries = 0;
            var check = function() {
                if (self.detectStatus === self.detectionStates.DETECTED) {
                    cb();
                    return;
                }
                retries+=1;
                if (retries > settings.WINDOW_OFFSET_DETECTOR_WAITFOR_MAX_RETRIES) {
                    console.error('WARNING: Waiting too much time to offset being detected');
                    return;
                }
                setTimeout(check,100);
            };
            check();
         }

    };


    PopupWindowOffsets.prototype.detect = function (x , y, callback) {
        callback = callback || function () {};
        var self = this;
        try {
            this._detector.open();
        } catch(error) {
            window.BootstrapDialog.show({
                message: 'Please disable your popup blocker!',
                buttons: [{
                    label: 'OK',
                    action: function (dialog) {
                        dialog.close();
                    }
                }]
            });
            return;
        }

        this._detector.popupPointer.addEventListener('load', function() {
            self.screenX = self._detector.getScreenX();
            self.screenY = self._detector.getScreenY();
            x = (x !== null && x !== undefined)? x : self.screenX + PopupWindowOffsets.SCREEN_INCREMENT;
            y = (y !== null && y !== undefined)? y : self.screenY + PopupWindowOffsets.SCREEN_INCREMENT;
            self._detector.moveToDetectDecoratorOffset(x , y ,function (decoratorOffsetX, decoratorOffsetY) {
                self.decoratorOffsetX = decoratorOffsetX;
                self.decoratorOffsetY = decoratorOffsetY;
                self.outerWidthOffset = self._detector.popupPointer.outerWidth - self._detector.popupPointer.innerWidth;
                self.outerHeightOffset = self._detector.popupPointer.outerHeight - self._detector.popupPointer.innerHeight;
                callback();
            });
        });
    };

    PopupWindowOffsets.SCREEN_INCREMENT = 100;

    PopupWindowOffsets.prototype.getScreenX = function () {
        return this.screenX;
    };
    PopupWindowOffsets.prototype.getScreenY = function () {
        return this.screenY;
    };
    PopupWindowOffsets.prototype.getDecoratorOffsetX = function () {
        return this.decoratorOffsetX;
    };
    PopupWindowOffsets.prototype.getDecoratorOffsetY = function () {
        return this.decoratorOffsetY;
    };

    return PopupWindowOffsets;
});
