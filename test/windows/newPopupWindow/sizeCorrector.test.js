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
    'windows/newPopupWindow/sizeCorrector',
    'windows/newPopupWindow/urlParameters'
], function(SizeCorrector, UrlParameters) {
    suite('SizeCorrector', function () {
        var sut, urlParameters, urlParametersMock, height;

        setup(function () {
            height = 100;
            urlParameters = new UrlParameters();
            urlParametersMock = sinon.mock(urlParameters);
            sut = new SizeCorrector(urlParameters);
        });

        suite('correctHeight', function () {
            test('should return same height on getURLparameter false', function() {
                urlParametersMock.expects('getURLParameter').once().withExactArgs('app').returns(1);
                var actual = sut.correctHeight(height);
                assert.equal(height, actual, 'Not the same height');
            });

            test('should return same height on getURLparameter false', function() {
                urlParametersMock.expects('getURLParameter').once().withExactArgs('app').returns(0);
                var actual = sut.correctHeight(height);
                assert.equal(height+34, actual, 'Not the same height');
            });
        });
    });
});
