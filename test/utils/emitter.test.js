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
    'utils/emitter'
], function(Emitter) {
    suite('Emitter', function () {
        var sut, event = 'testEvent', listener;

        setup(function() {
            listener = sinon.spy();
            sut = new Emitter();
        });

        test('on should add listener to object', function() {
            sut.on(event, listener);
            assert.deepEqual({funct:listener, scope: undefined}, sut.listeners[event][0]);
        });

        test('emit should call listener function', function() {
            sut.on(event, listener);
            sut.emit(event);
            assert.equal(true, listener.calledOnce, 'Not called');
        });
    });
});
