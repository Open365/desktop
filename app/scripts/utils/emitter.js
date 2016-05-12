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
define(function() {
    function Emitter() {
        this.listeners = {};
    };

    Emitter.prototype.on = function(event, listener, scope) {
        if(!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push({
            funct: listener,
            scope: scope
        });
    };


    Emitter.prototype.off = function(event, listener, scope) {
        if (!this.listeners[event]) {
            return;
        }
        this.listeners[event] =this.listeners[event].filter(_equals(listener, scope, false));
    };

    Emitter.prototype.emit = function(event) {
        if (!this.listeners[event]) {
            return;
        }
        var data = Array.prototype.slice.call(arguments, 1);
        this.listeners[event].forEach(function(item) {
            item.funct.apply(item.scope, data);
        });
    };

    return Emitter;
});

function _equals(listener, scope, expected) {
    return function(item) {
        return (
            item.funct === listener &&
            item.scope === scope
            ) === expected;
    };
}