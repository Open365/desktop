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
	'modules/presence/request'
], function (Request) {
	suite('Request suite', function () {
		var sut;
		var headers, parsedHeaders;
		var eyeosAuthClient;

		setup(function () {
			headers = {
				cred_one: 'some fake credentials',
				cred_two: { a: 'some fake credentials' }
			};
			parsedHeaders = {
				cred_one: 'some fake credentials',
				cred_two: '{"a":"some fake credentials"}'
			};
			eyeosAuthClient = { getHeaders: function(){ return headers; } };
			sut = new Request(eyeosAuthClient);
		});

		suite('#send', function () {
			var type = 'TYPE',
				url = 'http://fake_url',
				voidMethod = function () {},
				ajaxSettings;

			function execute () {
				ajaxSettings = {
					type: type,
					url: url,
					headers: parsedHeaders,
					success: voidMethod,
					error: voidMethod
				};
				sut.send(type, url, voidMethod, voidMethod);
			}

			test('calls to eyeosAuthClient.getHeaders', sinon.test(function () {
				this.stub($, 'ajax');
				this.mock(eyeosAuthClient)
					.expects('getHeaders')
					.once()
					.withExactArgs();
				execute();
			}));

			test('calls to $.ajax', sinon.test(function () {
				this.mock($)
					.expects('ajax')
					.once()
					.withExactArgs(ajaxSettings);
				execute();
			}));
		});

	});

});
