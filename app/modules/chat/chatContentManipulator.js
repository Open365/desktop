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

define([], function () {
    function ChatContentManipulator () {

    }

    ChatContentManipulator.prototype.adjust = function (content, chatScope) {
        var self = this;
        var inputAreaContainer = content.getElementsByClassName('chat-inputarea')[0];
        if (inputAreaContainer) {
            chatScope.height = content.offsetHeight - inputAreaContainer.offsetHeight;
        }
        else {
            setTimeout(function () {
                self.adjust(content, chatScope);
            }, 100);
        }
    };

    ChatContentManipulator.prototype.scroll = function (content, chatScope) {
        var self = this;
        var messagesContainer = content.getElementsByClassName('chat-container')[0];
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        else {
            setTimeout(function () {
                self.scroll(content, chatScope);
            }, 100);
        }
    };


    ChatContentManipulator.prototype.adjustAndScroll = function (content, chatScope) {
        var self = this;
        var inputAreaContainer = content.getElementsByClassName('chat-inputarea')[0];
        var messagesContainer = content.getElementsByClassName('chat-container')[0];
        if (inputAreaContainer && messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        else {
            setTimeout(function () {
                self.adjustAndScroll(content, chatScope);
            }, 100);
        }
    };

    ChatContentManipulator.prototype.focus = function (content, chatScope) {
        var self = this;
        var inputContainer = content.getElementsByClassName('chat-input')[0];
        if (inputContainer) {
            inputContainer.focus();
        }
        else {
            setTimeout(function () {
                self.focus(content, chatScope);
            }, 100);
        }
    };

    return ChatContentManipulator;
});