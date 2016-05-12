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
	'translations/eyeosTranslationService'
], function (EyeosTranslationService) {
	suite('eyeosTranslationService suite', function () {
		var sut;

		setup(function () {
			localStorage.clear();
			sut = new EyeosTranslationService();
		});


		suite('#getUserLanguage', function () {
			function exercise () {
				return sut.getUserLanguage();
			}
			test("when there's not anything stored in local storage should return 'en'", sinon.test(function () {
				var lang = exercise();
				assert.equal(lang, 'en');
			}));

			test("when there's a language stored in local storage should return it", sinon.test(function () {
				localStorage.setItem('userInfo', JSON.stringify({lang:'es'}));
				var lang = exercise();
				assert.equal(lang, 'es');
			}));

		});

	});

});