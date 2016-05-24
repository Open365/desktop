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

				function exerciseGetUrlSupport(type) {
					return scope.getUrlSupport(type);
				}

				function exerciseGetUrlAbout() {
					return scope.getUrlAbout();
				}

				function exerciseGetUserLanguage() {
					return scope.getUserLanguage();
				}

				function exerciseSupportAndAssert(type, expected) {
					sinon.stub(eyeosTranslation, "getUserLanguage");
					var actual = exerciseGetUrlSupport(type);
					assert.equal(expected, actual)
				}

				function exerciseAboutAndAssert(userLanguage, expected) {
					sinon.stub(eyeosTranslation, "getUserLanguage").returns(userLanguage);
					var actual = exerciseGetUrlAbout();
					assert.equal(expected, actual)
				}

				function exerciseUserLanguageAndAssert(userLanguage, expected) {
					sinon.stub(eyeosTranslation, "getUserLanguage").returns(userLanguage);
					var actual = exerciseGetUserLanguage();
					assert.equal(expected, actual)
				}

				test("when called and user language is english should return en", function() {
					var expected = "en";
					exerciseUserLanguageAndAssert("en", expected);
				});

				test("when called and user language is spanish should return es", function() {
					var expected = "es";
					exerciseUserLanguageAndAssert("es", expected);
				});

				test("when called and user language is germany should return en", function() {
					var expected = "en";
					exerciseUserLanguageAndAssert("de", expected);
				});

				test("when called should return default support url", function () {
					var expected = settings.URL_SUPPORT + "en";
					exerciseSupportAndAssert(null, expected);
				});

				test("when called with forum should return forum support url", function () {
					var expected = settings.URL_SUPPORT + "en" + settings.URL_FORUM;
					exerciseSupportAndAssert('forum', expected);
				});

				test("when called and userLanguage is english should return default about url", function(){
					var expected = settings.URL_ABOUT;
					exerciseAboutAndAssert('en', expected);
				});

				test("when called and userLanguage is spanish should return about spanish url", function(){
					var expected = settings.URL_ABOUT + "/es/index.html";
					exerciseAboutAndAssert('es', expected);
				});

				test("when called and userLanguage is uz should return default about url", function(){
					var expected = settings.URL_ABOUT;
					exerciseAboutAndAssert('uz', expected);
				});
			});
		});
	});
