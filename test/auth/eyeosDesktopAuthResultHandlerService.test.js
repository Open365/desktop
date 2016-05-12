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

suite('Service: authResultHandlerService', function(){
	var sut,
		eyeosHeaders,
		$window, SETTINGS;

	setup(function() {
		module('eyeosDesktopAuth');
		$window = {location: { href: sinon.spy()} };

		module(function($provide) {
			$provide.value('$window', $window);
			SETTINGS = $provide.constant('SETTINGS', {
				'LOGIN_URL': '/applogin',
				'ENVIRONMENT': 'release'
			})
		});

		inject(function(_authResultHandlerService_, _eyeosHeaders_, _$window_) {
			eyeosHeaders = _eyeosHeaders_;
			$window = _$window_;
			sut = _authResultHandlerService_;
		});
	});

	suite('setNewHeaders', function(){
		var fakeHeaders;
		setup(function () {
			fakeHeaders = {
				card: 'a card',
				signature: 'a signature'
			}
		});
		function exercise(fakeHeaders) {
			sut.setNewHeaders(fakeHeaders);
		}

		test('when called with headers should send them to eyeosHeaders', sinon.test(function(){
		    this.stub(eyeosAuthClient, 'getHeaders').returns(fakeHeaders);

			this.mock(eyeosHeaders)
			    .expects('setHeaders')
			    .once()
			    .withExactArgs(fakeHeaders);
			exercise(fakeHeaders);
		}));
	});

	suite('error', function(){
		function exercise() {
			sut.error();
		}

		test('when called should redirect to login page', sinon.test(function(){
			exercise();
			assert.equal($window.location.href, '/applogin');
		}));
	});




});

