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

define(['modules/chat/chatContentFactory', 'modules/chat/chatContentManipulator'], function (ChatContentFactory, ChatContentManipulator) {
    function ChatWindowManager() {
        this.chatContentFactory = new ChatContentFactory();
        this.chatContentManipulator = new ChatContentManipulator();

    }

    ChatWindowManager.prototype.adjustAndScroll = function (chatScope, chatWindow) {
        var content = this.chatContentFactory.getContent(chatWindow);
        if (content) {
            this.chatContentManipulator.adjustAndScroll(content, chatScope);
        }
    };

    ChatWindowManager.prototype.focus = function (chatScope, chatWindow) {
        var content = this.chatContentFactory.getContent(chatWindow);
        if (content) {
            this.chatContentManipulator.focus(content, chatScope);
        }
    };

    ChatWindowManager.prototype.showMessage = function (chatScope) {
        chatScope.$apply();
    };

    return ChatWindowManager;
});