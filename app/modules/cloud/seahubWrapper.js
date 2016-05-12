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
	function SeahubWrapper (desktopBus) {
		this.DesktopBus = desktopBus || DesktopBus;
		this.subscriptions = [];
	}

	SeahubWrapper.prototype.start = function () {
		this.subscribeAll();
	};

	SeahubWrapper.prototype.subscribeAll = function () {
		var self = this;
		this.subscriptions.push(this.DesktopBus.subscribe('chat.resizeStart', function() {
			self.getIframe().css('pointer-events','none');
		}));

		this.subscriptions.push(this.DesktopBus.subscribe('chat.resizeEnd', function() {
			self.getIframe().css('pointer-events','all');
		}));
	};

	SeahubWrapper.prototype.getIframe = function() {
		var seahubIframe = $('#seahubIframe');

		if (seahubIframe.length) {
			return seahubIframe;
		} else {
			return false;
		}
	};

	SeahubWrapper.prototype.redirectToSeafile = function() {
		var seahubUrl = this.getUrlVar('target');
		if (seahubUrl === false) {
			return;
		}

		var seahubUrlConverted = atob(decodeURIComponent(seahubUrl));
		var seahubIframe = this.getIframe();
		var regexResult = /^\/sync/.test(seahubUrlConverted) || /^\/sync\/repo\/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}\/history\/files\/\?obj_id\=[0-9]*\&commit_id\=[0-9a-z]{40}\&p\=\/.{1,255}$/.test(seahubUrlConverted);

		if (seahubUrlConverted && seahubIframe && regexResult) {
			seahubIframe[0].setAttribute('src', seahubUrlConverted);
		}
	};

	SeahubWrapper.prototype.getUrlVar = function(variable) {
		var vars = {};
		window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		return vars[variable] || false;
	};

	SeahubWrapper.prototype.login = function() {
		var self = this;
		this.loginTimeout = setTimeout(function() {
			var seahubIframe = self.getIframe();
			if (seahubIframe) {
				self.redirectToSeafile();
				seahubIframe.on('load', function() {
					var contentWindow = seahubIframe[0].contentWindow,
						loginForm = contentWindow.$('input[type=text][name=login]').closest("form");
					if (contentWindow.$('input[type=text][name=login]').length) {
						contentWindow.$('input[type=text][name=login]').val(eyeosAuthClient.getUsername());
						$('<input/>').attr({ type: 'hidden', name: 'password'})
							.appendTo(loginForm)
							.val(
								JSON.stringify({
									card: localStorage.card,
									signature: localStorage.signature
								})
							);
						contentWindow.$('input[type=password][name=password]').remove();
						contentWindow.$('#main-panel > div > form > input.submit').click();
					} else {
						self.DesktopBus.dispatch('seahub.ready');
					}
				});
			} else {
				self.login();
			}
		}, 100);
	};

	SeahubWrapper.prototype.openMyHome = function() {
		this.getIframe().attr('src', 'sync/#');
	};

	SeahubWrapper.prototype.openGroups = function() {
		this.getIframe().attr('src', 'sync/#groups/');
	};

	SeahubWrapper.prototype.openOrg = function() {
		this.getIframe().attr('src', 'sync/#org/');
	};

	SeahubWrapper.prototype.reload = function() {
		this.getIframe()[0].contentWindow.location.reload(true);
	};

	SeahubWrapper.prototype.clearTimers = function () {
		clearTimeout(this.loginTimeout);
		this.loginTimeout = null;
	};

	SeahubWrapper.prototype.dispose = function () {
		this.clearTimers();

		this.subscriptions.forEach(function (sub) {
			sub.unsubscribe();
		});
	};

	return SeahubWrapper;
});
