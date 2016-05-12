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

//ALL POPUPWINDOW CLASSES ARE DEPRECATED, PLEASE CHECK THEIR COUNTERPART AT NEWPOPUPWINDOW
define(function() {
    function WindowOnMove() {

    }

    WindowOnMove.prototype.addEventListener = function(event, callback) {
        if(event === 'move') {
            var oldX = this.popupPointer.screenX,
                oldY = this.popupPointer.screenY;
            var self = this;
            var interval = setInterval(function() {
                //when closing a popup screenX and Y turns to 0 for a moment and this will be detected as move event
                //we use location origin to check if popup is closing, FRAGILE
                if(oldX != self.popupPointer.screenX || oldY != self.popupPointer.screenY){
                    if (self.popupPointer.location.origin) {
                        callback(self.popupPointer.screenX, self.popupPointer.screenY, true);

                    }
                } else {
                    callback(self.popupPointer.screenX, self.popupPointer.screenY, false);
                }

                oldX = self.popupPointer.screenX;
                oldY = self.popupPointer.screenY;
            }, 100);

            return interval;
        } else {
            console.error('event not implemented.');
        }

    };

    WindowOnMove.prototype.setWindow = function(popupPointer) {
        this.popupPointer = popupPointer;
    };

    return WindowOnMove;
});
