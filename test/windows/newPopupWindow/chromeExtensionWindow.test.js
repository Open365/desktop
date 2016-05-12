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
    'windows/newPopupWindow/nativeWindow',
    'windows/newPopupWindow/chromeExtensionWindow',
	'../../../test/windows/newPopupWindow/nativeWindow.test'
], function(NativeWindow, ChromeExtensionWindow, parentTest) {
    var sut;
	var oldWindow = window;


    suite('ChromeExtensionWindow', function() {
        setup(function() {

	        window.events = {};
	        window.addEventListener = function (event, fp){
		        this.events[event] = fp;
	        };
	        window.triggerEvent = function(event, args){
		        this.events[event].apply(this, args);
	        };

	        oldWindow = window.eyeosVdiClient;
	        parentTest.prepareWindow();
            sut = parentTest.constructSut(ChromeExtensionWindow);
        });

        teardown(function() {
	        window.eyeosVdiClient = oldWindow;
	        window = oldWindow;
        });


	    suite('open', function(){
		    var chromeWindowId, msg;

	        function exercise() {
		        parentTest.exerciseOpen(false, 10, 10, 10, 10);
		        parentTest.triggerEvent('load');
		        window.triggerEvent('message', [msg]);
	        }

		    setup(function () {
			    chromeWindowId = 78237823;
			    msg = {
				    data: {
					    event: "popupCreated",
					    eyeWinId: sut._id,
					    chromeWindowId: chromeWindowId
				    }
			    }
		    });

		    test("when popupCreated's message received should set chromeWindowId", sinon.test(function() {
		        exercise();
			    assert.equal(sut.chromeWindowId, chromeWindowId);
	        }));

	    });


	    suite('focus', function(){
		    var chromeWindowId;
		    function exercise() {
			    sut.chromeWindowId = 78237823;
			    sut.focus();
		    }

		    setup(function () {
			    chromeWindowId = 78237823;
		    });


		    test('when called should send an event to the extension', sinon.test(function(){
			    var stub = this.stub(document, 'dispatchEvent');
			    exercise();
			    assert.equal(stub.args[0][0].type, 'focusWindow');
			    assert.deepEqual(stub.args[0][0].detail, {windowId: chromeWindowId});
		    }));
	    });

    });

});
