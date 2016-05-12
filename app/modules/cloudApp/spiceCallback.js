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

define([], function () {
	function SpiceCallback (app, cloudResizer, desktopBus) {
		this.app = app;
		this.cloudResizer = cloudResizer;
		this.desktopBus = desktopBus || window.DesktopBus;
	}

	SpiceCallback.prototype.subscribe = function () {
	    var self = this;
	    window.DesktopBus.subscribe('vdiResetActivity', function() {
	        self.app.resetActivity();
	    });
	};

	SpiceCallback.prototype.callback = function (action, params) {
		if (action == 'ready') {
			var self = this;
			// This is for the reconnection service
			window.DesktopBus.dispatch('wm.connect.ready');
			// This is to prevent a race condition when it takes longer to connect to the bus than what
			// it takes the docker to launch the app. This forces the guest service to fire a ready.
			this.isReadyTimer = window.setInterval(function () {
				console.log("GuestServices not ready, requesting!!!!");
				self.app.sendCommand('guestServicesIsReady', {});
			}, 500);
		} else if (action == 'fileShare') {
			this.desktopBus.dispatch('fileShare.downloadUrl', params.value);
		} else if (action == 'fileDownload') {
			this.desktopBus.dispatch('fileDownload', params.value);
		} else if (action == 'fileUpload') {
			this.desktopBus.dispatch('fileUpload', params.value);
		} else if (action == 'fileOpened') {
			this.desktopBus.dispatch('eyeosCloud.fileOpened', params.value);
		} else if (action == 'printFile') {
			this.desktopBus.dispatch('printFile', params.value);
		} else if (action == 'guestServicesReady') {
			this.cloudResizer.resize();
			window.clearInterval(this.isReadyTimer);

			this.desktopBus.dispatch("eyeosCloud.ready");

		} else if (action == 'activityLost') {
            this.desktopBus.dispatch('vdiActivityLost');
        } else if (action == 'error') {
			// This message is handled by reconnection service
			this.desktopBus.dispatch('wm.connect.error', params);
		}
	};

	return SpiceCallback;
});
