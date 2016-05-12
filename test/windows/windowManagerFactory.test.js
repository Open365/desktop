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
    'windows/newPopupWindow/urlParameters',
    'windows/windowManagerFactory',
    'windows/newPopupWindow/popupFactory',
    'windows/ventusWindow/ventusFactory',
    'windows/focusDetector',
    'settings'
], function(UrlParameters, WindowManagerFactory, PopupFactory, VentusFactory, FocusDetector, settings) {
    suite('WindowManagerFactory', function () {
        var sut, urlParameters, popupFactory,
            ventusFactory,
            focusDetector, focusDetectorStub;
        var oldWMSettings, scope;

        setup(function () {
            oldWMSettings = settings.WINDOW_MANAGER_STRATEGY;
            urlParameters = new UrlParameters();
            popupFactory = new PopupFactory();
            ventusFactory = new VentusFactory();
            focusDetector = new FocusDetector();
            focusDetectorStub = sinon.stub(focusDetector);
	        scope = createFakeScope();
            sut = new WindowManagerFactory(urlParameters, popupFactory, ventusFactory, focusDetectorStub);
            sut.init();
        });

        teardown(function () {

        });

        suite('getWindowManager', function(){
            suite('when strategy is mixed ', function(){
                setup(function () {
                    settings.WINDOW_MANAGER_STRATEGY = 'mixed'
                });
                teardown(function () {
                    settings.WINDOW_MANAGER_STRATEGY = oldWMSettings;
                });

	            suite('when no openType defined', function(){
		            test('when desktop is focused should return ventusWM', sinon.test(function(){
			            makeDesktoplastFocused();
			            var returnedWM = sut.getWindowManager(scope);
			            assert.equal(returnedWM, sut._ventusWindowManager);
		            }));

		            test('when popup is focused should return popupWM', sinon.test(function(){
			            makePopuplastFocused();
			            var returnedWM = sut.getWindowManager(scope);
			            assert.equal(returnedWM, sut._popupWindowManager);
		            }));

	            });

	            test('when openType is detached_application should return popupWM', sinon.test(function(){
		            scope.appData.openType = 'detached_application';
		            makeDesktoplastFocused();
		            var returnedWM = sut.getWindowManager(scope);
		            assert.equal(returnedWM, sut._popupWindowManager);
	            }));

	            test('when openType is attached_application should return ventusWM', sinon.test(function(){
		            scope.appData.openType = 'attached_application';
		            makeDesktoplastFocused();
		            var returnedWM = sut.getWindowManager(scope);
		            assert.equal(returnedWM, sut._ventusWindowManager);
	            }));

            });
        });


        function makeDesktoplastFocused () {
            focusDetectorStub.getLastFocused.returns('desktop');
        }
        function makePopuplastFocused () {
            focusDetectorStub.getLastFocused.returns('popup');
        }

	    function createFakeScope() {
		    return {
			    appData: {
				    openType: ''
			    }
		    }
	    }
    });
});
