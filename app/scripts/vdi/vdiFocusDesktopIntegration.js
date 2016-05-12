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
	'utils/desktopBus',
	'vdi/vdiFocuser'
], function (DesktopBus, VdiFocuser) {

	function VdiFocusDesktopIntegration (vdiFocuser, desktopBus) {
		this.vdiFocused = false;
		this.DesktopBus = desktopBus || DesktopBus;
		this.vdiFocuser = vdiFocuser || new VdiFocuser();
	}

	VdiFocusDesktopIntegration.CHECK_VDI_FOCUS_INTERVAL_MS = 500;

	VdiFocusDesktopIntegration.prototype.start = function () {
		var self = this;

		setInterval(function (){
			if(isFocusedAnythingNotRelatedToVdi()){
				if(self.vdiFocused) {
					self.vdiFocuser.disableKeyboard();
					self.vdiFocused = false;
				}
			} else {
				if(!self.vdiFocused) {
					self._focusVdi();
				}
			}
		}, VdiFocusDesktopIntegration.CHECK_VDI_FOCUS_INTERVAL_MS);

		function isFocusedAnythingNotRelatedToVdi () {
			var activeElement = $(document.activeElement);

			return (activeElement.is("input") && activeElement.attr('id') !== "inputmanager" || activeElement.is("textarea"));
		}

		this.DesktopBus.subscribe('eventLayerCreated', function(eventLayer) {
			self._prepareFocusInVdi(eventLayer);
		});
	};

	VdiFocusDesktopIntegration.prototype._focusVdi = function () {
		this.vdiFocuser.enableKeyboard();
		this.vdiFocused = true;
	};
	VdiFocusDesktopIntegration.prototype._prepareFocusInVdi = function  (canvasEventLayer) {
		var self = this;
		canvasEventLayer.addEventListener('click', function(){
			self._focusVdi();
		});
	};

	return VdiFocusDesktopIntegration;
});
