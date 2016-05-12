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
require([
	'print/eyeosPrintHandler'
], function(eyeosPrintHandler) {
	var sut;
	suite('Service: eyeosPrintHandler', function () {
		var id = "fakeId",
			idFrame;

		setup(function () {
			sut = new eyeosPrintHandler(id);
			idFrame = sut.iframeIdPrefix + "1234";
		});

		teardown(function () {
			$("#" + id).remove();
			$("#" + idFrame).remove();
		});

		test('should append an iframe', function () {
			sut.printMe({ data: { url: "/fakeUrl" } });
			assert.equal($('body').find('#' + id).length, 1);
		});

		test('should remove iframe#printFileContainer', function () {
			var iframe = $('<iframe></iframe>');
			iframe.attr({
				'id': idFrame,
				'width': 0,
				'height': 0
			});
			iframe.appendTo('body');
			sut.printMe({ data: { url: "/fakeUrl" } });
			assert.equal($('body').find('#' + idFrame).length, 0);
		});



	});

});
