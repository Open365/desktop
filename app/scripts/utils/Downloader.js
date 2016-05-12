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

'use strict'

define([
	'./ErrorDialog'
], function(ErrorDialog) {
	var Downloader = function (translate, jquery) {
		this.$translate = translate;
		this.$ = jquery || $;
	};

	Downloader.prototype.start = function (serverPath) {
		var self = this;

		this.getDonwloadUrl(serverPath, function (data, status, jqXHR) {
			self.success(data, status, jqXHR);
		}, function (jqXHR, status, error) {
			self.error(jqXHR, status, error);
		});

	};

	Downloader.prototype.setNewTabStrategy = function () {
		this.strategy = 'newTab';
	};

	Downloader.prototype.performDonwload = function (url) {
		if (this.strategy === 'newTab') {
			window.open(url+ "/view", '_blank');
		} else {
			var iframe = document.createElement('iframe');
			iframe.setAttribute('src', url);
			iframe.style.visibility = 'hidden';
			iframe.style.width = '1px';
			iframe.style.height = '1px';
			iframe.style.position = 'absolute';
			iframe.style.left = '0px';
			iframe.style.top = '0px';

			document.getElementsByTagName('body')[0].appendChild(iframe);
		}

	};


	Downloader.prototype.success = function (data, status, jqXHR) {
		if (status === 'success') {
			this.performDonwload(data.url);
		} else {
			this.displayErrorAlert();
		}
	};

	Downloader.prototype.displayErrorAlert = function () {
		var $translate = this.$translate;
		var dialog = new ErrorDialog($translate.instant('Download Error'), $translate.instant('Download Error'));
		dialog.show();
	};

	Downloader.prototype.error = function (jqXHR, status, error) {
		this.displayErrorAlert();
	};


	Downloader.prototype.prepareUrl = function (path) {
		var basicUrl = window.document.location.protocol + '//' + document.domain;
		return basicUrl + encodeURI(path).replace("#", "%23");
	};

	Downloader.prototype.getDonwloadUrl = function (serverPath, success, error, beforeSend) {
		var url = serverPath;
		var card = localStorage.getItem('card') || '{"expiration":2410643990,"username":"anonymous"}';
		var signature = localStorage.getItem('signature') || 'jeKybkOrjlefQwo2T9JYdMERO6K/zZVpxEpif18C2un9Mp8DrjOY2X3Vqs/47xtMwE3To5kIN+wKozPlJbjjug==';
		this.$.ajax({
			beforeSend: beforeSend || function (request) {
				request.setRequestHeader("signature", signature);
				request.setRequestHeader("card", card);
			},
			dataType: "json",
			url: this.prepareUrl(serverPath),
			success: success,
			error: error
		});
	};

	return Downloader;
});
