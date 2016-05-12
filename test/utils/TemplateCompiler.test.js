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
define(['utils/TemplateCompiler'], function (TemplateCompiler) {
	suite('TemplateCompiler.test.js suite', function () {
		var sut, $http, $compile, $q, $rootScope;

		setup(function () {
			module('utils');

			inject(function($injector) {
				$rootScope = $injector.get('$rootScope');
				$q = $injector.get('$q');
				$http = $injector.get('$http');
				$compile = $injector.get('$compile');
				sut = $injector.get('TemplateCompiler');
			});
		});


		suite('#compile', function () {
			var aTemplateFile, scope, callback,
				defer;
			setup(function () {
				aTemplateFile = 'aTemplateFile.tpl.html';
				scope = {};
				callback = sinon.stub();
				defer = $q.defer();
			});

			function exercise(aTemplateFile, scope, callback) {
				return sut.compile(aTemplateFile, scope, callback);
			}

			test('should make a request to get the template file', sinon.test(function () {
				var httpGetStub = sinon.stub($http, 'get').returns(defer.promise);
				exercise(aTemplateFile, scope, callback);
				sinon.assert.calledWithExactly(httpGetStub, aTemplateFile);
			}));

			suite('when the template is obtained ', function(){
				var httpGetStub, response, promise, domElement;

				setup(function () {
					response = {
						data: 'myTemplateContent'
					};
					defer = $q.defer();
					promise = defer.promise;
					httpGetStub = sinon.stub($http, 'get').returns(promise);
					domElement = 'a dom element';
					var templateFunc = sinon.stub().returns(domElement);
					sut.$compile = sinon.stub().returns(templateFunc);
				});

				test('should call callback with template domElement', function(done){
					exercise(aTemplateFile, scope, callback);
					defer.resolve(response);
					$rootScope.$apply();
					sinon.assert.calledWithExactly(callback, domElement);
					done();
				});
			});

		});

	});

});
