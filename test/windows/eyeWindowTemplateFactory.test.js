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
	'windows/eyeWindowTemplateFactory',
	'windows/EyeCanvasWindow',
	'windows/EyeIframeWindow',
	'windows/EyeUrlWindow',
	'windows/eyeWindowsModule'
], function(WindowTemplateFactory, EyeCanvasWindow, EyeIframeWindow, EyeUrlWindow) {
	suite('Service: WindowTemplateFactory', function () {
		var sut;

		setup(function () {
			// load the controller's module
			module('eyeWindows');
			inject(function (WindowTemplateFactory) {
				sut = WindowTemplateFactory;
			});

		});

		suite('#getWindow', function () {
			setup(function () {

			});

			function exercise (url, appData) {
				return sut.getWindow(url, appData);
			}

			test('when passed a canvas should return an EyeCanvasWindow', sinon.test(function(){
				var appData = {
					canvas: 'aCanvas'
				};

				var returnedWindow = exercise('', appData);
				assert.isTrue(returnedWindow instanceof EyeCanvasWindow);
			}));

			test('when passed a url should return an EyeIframeWindow', sinon.test(function(){
				var url = 'aUrl';

				var returnedWindow = exercise(url);
				assert.isTrue(returnedWindow instanceof EyeIframeWindow);
			}));
			test('when passed a url should return an EyeUrlWindow', sinon.test(function(){
				var url = 'aUrl';
				var appData = {
					type: 'external_application'
				};
				var returnedWindow = exercise(url, appData);
				assert.isTrue(returnedWindow instanceof EyeUrlWindow);
			}));

		});
	});
});
