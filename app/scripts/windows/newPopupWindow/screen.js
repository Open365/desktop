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
define(function() {
    function Screen(popupWindowOffsets) {
		this.popupWindowOffsets = popupWindowOffsets;
    }

    Screen.prototype.getX = function() {
        return this.popupWindowOffsets.getScreenX();
    };

    Screen.prototype.getY = function() {
        return this.popupWindowOffsets.getScreenY();
    };

    Screen.prototype.isIn = function(singleScreenMode, currentScreenSize, currentWinCoordinates) {
        if (singleScreenMode) {
            if (currentWinCoordinates.screenX < this.popupWindowOffsets.getScreenX() ||
                currentWinCoordinates.screenX + this.popupWindowOffsets.getDecoratorOffsetX() > this.popupWindowOffsets.getScreenX() + currentScreenSize.width ||
                currentWinCoordinates.screenY + this.popupWindowOffsets.getDecoratorOffsetY() < this.popupWindowOffsets.getScreenY() ||
                currentWinCoordinates.screenY > this.popupWindowOffsets.getScreenY() + currentScreenSize.height) {
                return false;
            }
        }
        return true;
    };

    Screen.prototype.isFullyIn = function(currentScreenSize, currentWindow) {
        return !(currentWindow.screenX < this.popupWindowOffsets.getScreenX() - $(currentWindow).width() ||
        currentWindow.screenX > this.popupWindowOffsets.getScreenX() + currentWindow.width ||
        currentWindow.screenY < this.popupWindowOffsets.getScreenY() - $(currentWindow).height() ||
        currentWindow.screenY > this.popupWindowOffsets.getScreenY() + currentWindow.height);

    };

    window.WorkspaceScreen = Screen;
    return Screen;
});
