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
		'startMenu/startMenuController',
		'translations/eyeosTranslationService',
		'settings'
	],
	function (StartMenuController, EyeosTranslation, settings) {
		suite('StartMenuController', function () {
			var sut;
			var SETTINGS;
			var $window;
			var scope;
			var eyeosTranslation;

			setup(function () {

				scope = {};
				SETTINGS = {};
				$window = {};
				eyeosTranslation = new EyeosTranslation();

				sut = new StartMenuController(scope, null, SETTINGS, $window, eyeosTranslation);

			});
			teardown(function (){
			});

			suite('#getUrlSupport', function () {

				setup(function() {
				});
				teardown(function() {
				});

				function exercise(type) {
					return scope.getUrlSupport(type);
				}

				function exerciseAndAssert(type, expected) {
					sinon.stub(eyeosTranslation, "getUserLanguage");
					var actual = exercise(type);
					assert.equal(expected, actual)
				}

				test("when called should return default support url", function () {
					var expected = settings.URL_SUPPORT + "en";
					exerciseAndAssert(null, expected);
				});

				test("when called with forum should return forum support url", function () {
					var expected = settings.URL_SUPPORT + "en" + settings.URL_FORUM;
					exerciseAndAssert('forum', expected);
				});
			});
		});
	});
