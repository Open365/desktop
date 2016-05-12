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
define([], function () {

    function ChatController(settings) {
        this.settings = settings;
    }

    ChatController.prototype.start = function (cb) {
        if (!this.settings.CONNECT_TO_CHAT) {
            return;
        }
        var self = this;
        var card = JSON.stringify(eyeosAuthClient.getHeaders().card);
        var signature = eyeosAuthClient.getHeaders().signature;
        var authInfo = JSON.stringify({card:card, signature:signature});
        var random = getRandomArbitrary(0, 1000000);

        this.host = this.settings.CHAT_HOST;
        this.username = eyeosAuthClient.getHeaders().card.username;
        this.domain = eyeosAuthClient.getHeaders().card.domain;
        this.resource = 'web'+random;

        // ejabberd user ID
        this.fullJID = this.username + "#" + this.domain + "@" + this.host +  "/" + this.resource;

        var BOSH_SERVICE = '/http-bind/';
        var connection = null;

        function onMessage(msg) {
            console.log(msg);
            var from = msg.getAttribute('from');
            var type = msg.getAttribute('type');
            var elems = msg.getElementsByTagName('body');
            var displayName = msg.getElementsByTagName('eyeosName')[0];
            var chatID = Strophe.getText(msg.getElementsByTagName('chatID')[0]);

            if (type === "chat" && elems.length > 0) {
                var body = elems[0];

                if (from.indexOf('/') > -1) {
                    from = from.substr(0, from.indexOf('/'));
                }
                from = from.split("#")[0];

                // carbon copy
                if (from === self.username) {
                    return cb(chatID, Strophe.getText(displayName), Strophe.getText(body), true);
                }
                else {
                    return cb(from, Strophe.getText(displayName), Strophe.getText(body));
                }

            }

            return true;
        }


        function onConnect(status)
        {
            if (status === Strophe.Status.CONNECTING) {
                console.log('Connecting to chat with JID:', self.fullJID);
            } else if (status === Strophe.Status.CONNFAIL) {
                console.log('Failed to connect.');
            } else if (status === Strophe.Status.DISCONNECTING) {
                console.log('Disconnecting.');
            } else if (status === Strophe.Status.DISCONNECTED) {
                console.log('Disconnected.');
            } else if (status === Strophe.Status.CONNECTED) {
                console.log('Connected to chat!');

                // event lister for handling incoming messages
                connection.addHandler(onMessage, null, 'message', null, null,  null);

                // tell ejabbberd we have entered the server
                self.sendInitialPresence();
                self.initCarbonCopy();
            } else if(status === Strophe.Status.AUTHFAIL) {
                console.log('Failed to auth');
            }
        }

        function getRandomArbitrary(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }

        // connect to the ejabberd server
        connection = new Strophe.Connection(BOSH_SERVICE);
        connection.connect(this.fullJID, authInfo, onConnect);

        this.connection = connection;
    };

    ChatController.prototype.sendMessage = function (to, displayName,textToSend) {
        var chatID = to;
        to += '#'+this.domain +'@'+this.host;

        var message = $msg({to: to, type: 'chat'})
            .cnode(Strophe.xmlElement('body', textToSend))
            .up()
            .c('active', {xmlns: "http://jabber.org/protocol/chatstates"})
            .up()
            .cnode(Strophe.xmlElement('eyeosName', displayName))
            .up()
            .cnode(Strophe.xmlElement('chatID', chatID));
        this.connection.send(message);
    };
    ChatController.prototype.sendInitialPresence = function () {

        // set priority for all resources to 5
        var stanza = $pres().c("priority", 5);
        this.connection.send(stanza);
    };

    ChatController.prototype.initCarbonCopy = function () {
        // enable the carob copy module within ejabberd

        var iq = $iq({from: this.fullJID, id: 'enable1', type: 'set'})
            .c('enable', {xmlns: 'urn:xmpp:carbons:2'});

        this.connection.sendIQ(iq);
    };

    return ChatController;
});
