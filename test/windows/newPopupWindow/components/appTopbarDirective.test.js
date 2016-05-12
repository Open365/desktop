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

], function() {
	suite('Directive: appTopbar', function () {
		var element,
			scope, $compile, $interval;

		setup(function () {
			module('appTopbar');

			inject(function ($rootScope, _$compile_, _$interval_) {
				scope = $rootScope.$new();
				$compile = _$compile_;
				$interval = _$interval_;
			});

			scope.$emit = sinon.stub();
		});




		function exercise() {
			element = $compile("<div app-topbar-directive></div>")(scope);
			scope.$digest();
		}

		test('should call scope.emit when height changes to different than 0', sinon.test(function(){
			exercise();
			element.height(12);
			$interval.flush(101);
			assert(scope.$emit.called, 'Emit not called');
		}));

		test('should not call scope.emit when height is 0', sinon.test(function(){
			exercise();
			$interval.flush(101);
			assert(scope.$emit.notCalled, 'Emit should not be called');
		}));


	});
});
