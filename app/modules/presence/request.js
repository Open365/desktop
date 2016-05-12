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
	'eyeosAuthClient'
], function (EyeosAuthClient) {
	function Request(eyeosAuthClient) {
		this.eyeosAuthClient = eyeosAuthClient || EyeosAuthClient;
	}

	/**
	 * PRIVATE
	 */

	function getHeaders () {
		var headers = {},
			cred = this.eyeosAuthClient.getHeaders();
		for (var i in cred) {
			if (!cred.hasOwnProperty(i)) {
				continue;
			}
			if (typeof(cred[i]) === 'object') {
				headers[i] = JSON.stringify(cred[i]);
			} else {
				headers[i] = cred[i];
			}
		}
		return headers;
	}

	/**
	 * End PRIVATE
	 */

	Request.prototype.send = function (type, url, connectOk, connectError) {
		var headers = getHeaders.call(this);
		$.ajax({
			type: type,
			url: url,
			headers: headers,
			success: connectOk,
			error: connectError
		});
	};

	return Request;
});
