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

suite('Service: eyeosHeaders', function(){
	var sut, http;

	setup(function() {
		module('eyeosDesktopAuth');

		inject(function(_eyeosHeaders_, $http) {
			http = $http;
			sut = _eyeosHeaders_;
		});

	});
	teardown(function () {
	});


	test('setHeaders when called with headers should set them to $http requests', function () {
		var fakeHeaders = {
			"card": 'myCard',
			"signature": 'mySignature'
		};
		sut.setHeaders(fakeHeaders);
		assert.equal(http.defaults.headers.common.card, "myCard");
		assert.equal(http.defaults.headers.common.signature, "mySignature");
	});

	test('setHeaders when called with headers and one of them is an object should should stringify them', function () {
		var fakeHeaders = {
			"card": {'expiration': 1417444428, 'username': 'pepito'},
			"signature": 'mySignature'
		};
		sut.setHeaders(fakeHeaders);
		assert.equal(http.defaults.headers.common.card, JSON.stringify(fakeHeaders.card));
		assert.equal(http.defaults.headers.common.signature, "mySignature");
	});


	test('setHeaders when called without headersshould not set any header', function () {
		sut.setHeaders();
		assert.isUndefined(http.defaults.headers.common.card);
		assert.isUndefined(http.defaults.headers.common.signature);
	});


});

