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
	'utils/desktopBus',
	'bower/postal.js/lib/postal',
	'print/eyeosPrintService',
	'eyeosSchemes'
], function(DesktopBus, postal, eyeosPrintService, eyeosSchemes) {
	var sut, scope, oldPostal;
	var fakePath = "a fake path";
	var data = { path: "print://fakeFile.txt" };
	var httpResponse = { then: function () {} };
	var fakeHttpBackend = { get: function () { return httpResponse; } };
	var fakeResolver = { getPath: function () { return fakePath; } };

	suite('Service: eyeosPrintService', function () {
		function execute () {
			DesktopBus.dispatch("printFile", data);
		}

		setup(function () {
			oldPostal = window.postal;
			window.postal = postal;
			// load the service's module
            module('eyeosPrint');
			inject(function ($rootScope) {
				scope = $rootScope.$new();
				sut = new eyeosPrintService(scope, fakeHttpBackend);
			});
		});

		teardown(function () {
			scope.unsubscribe();
			window.postal = oldPostal;
		});

		test('when receiving printFile event should do a request the cdn', sinon.test(function () {
			this.mock(fakeHttpBackend)
				.expects('get')
				.once()
				.withExactArgs(encodeURI(fakePath), { cache: true })
				.returns(httpResponse);
			this.stub(eyeosSchemes, 'getResolver').returns(fakeResolver);
			execute();
		}));

		// TODO: need more tests

	});

});
