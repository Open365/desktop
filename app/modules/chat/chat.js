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


define([
	'settings',
	'modules/chat/chatController',
	'app/appInfo',
	'modules/chat/chatWindowManager'
], function (settings, ChatController, AppInfo, ChatWindowManager) {
	angular.module('chat', ['peopleGroupsModule'])
		.controller('chatController', ['$scope', '$http', 'peopleGroupsService', '$translate',
			function ($scope, $http, peopleGroupsService, $translate) {
				var chat = new ChatController(settings);
				var chatWindowManager = new ChatWindowManager();
				window.chat = chat;
				var chatScopes = {};
				var videoChatMessages = {
					REQUEST: '/startvideochat',
					ACCEPT: '/acceptvideochat',
					DECLINE: '/declinevideochat'
				};

				if (Notification.permission !== "granted") {
					Notification.requestPermission();
				}

				var window_focus;

				$(window).focus(function () {
					window_focus = true;
				}).blur(function () {
					window_focus = false;
				});

				window.setTimeout(function () {
					var contentIframe = $('#seahubIframe');
					if (contentIframe.length) {
						$(contentIframe[0].contentWindow).focus(function () {
							window_focus = true;
						}).blur(function () {
							window_focus = false;
						});
					}

				}, 1000);

				chat.start(function (from, displayName, text, carbonCopy) {
					if (!window_focus && Notification.permission === "granted") {
						var notification = new Notification(displayName, {
							icon: '/themes/eyeos-cloud/images/open365-158x158.png',
							body: text
						});

						window.setTimeout(function () {
							notification.close();
						}, 5000);

						notification.onclick = function () {
							window.focus();
							notification.close();
						};
					}

					// on message
					text = decodeEntities(text);

					window.DesktopBus.dispatch('chat.started', from);


					var msgInfo;

					if (carbonCopy) {
						msgInfo = getOutgoingMessageInfo(displayName, text);
						from = carbonCopy.id;
						displayName = carbonCopy.name;
					}
					else {
						msgInfo = getIncomingMessageInfo(displayName, text);
					}

					// if conversation already exists
					if (chatScopes[from]) {
						chatScopes[from].messages.push(msgInfo);

						setTimeout(function () {
							chatWindowManager.showMessage(chatScopes[from]);
							chatWindowManager.adjustAndScroll(chatScopes[from], chatScopes[from].window);
						}, 0);
					}

					// else if new conversation
					else {
						requestChat(from, displayName, msgInfo);
					}

					if (text === videoChatMessages.REQUEST) {
						chatScopes[from].videochat.pendingRequest = true;
					}
					return true;
				});

				var getIncomingMessageInfo = function(displayName, text) {
					var msgInfo = {
						from: displayName,
						text: text,
						cssClass: "chat-messages__in",
						videoChatRequest: false
					};

					switch (text) {
						case videoChatMessages.REQUEST:
							msgInfo.videoChatRequest = true;
							msgInfo.text = $translate.instant("Start videoconference?");
							msgInfo.showButtons = true;
							break;
						case videoChatMessages.ACCEPT:
							msgInfo.videoChatRequest = true;
							msgInfo.text = $translate.instant("User accepts!");
							msgInfo.showButtons = false;
							break;
						case videoChatMessages.DECLINE:
							msgInfo.videoChatRequest = true;
							msgInfo.text = $translate.instant("User declines!");
							msgInfo.showButtons = false;
							break;
					}

					return msgInfo;
				};

				var getOutgoingMessageInfo = function(from, textToSend) {
					return {
						from: from,
						text: textToSend,
						cssClass: "chat-messages__out"
					};
				};

				DesktopBus.subscribe('push.onlineUser', function (event, data) {
					var dataParsed = JSON.parse(data.data);

					for (var i in chatScopes) {
						if (chatScopes.hasOwnProperty(i) && (i === dataParsed.user)) {
							chatScopes[i].peerOnline = true;
							chatWindowManager.showMessage(chatScopes[i]);
							chatWindowManager.adjustAndScroll(chatScopes[i], chatScopes[i].window);

						}
					}
					$scope.$apply();
				});

				DesktopBus.subscribe('push.offlineUser', function (event, data) {
					var dataParsed = JSON.parse(data.data);

					for (var i in chatScopes) {
						if (chatScopes.hasOwnProperty(i) && (i === dataParsed.user)) {
								chatScopes[i].peerOnline = false;
								chatWindowManager.showMessage(chatScopes[i]);
								chatWindowManager.adjustAndScroll(chatScopes[i], chatScopes[i].window);
						}
					}
					$scope.$apply();
				});

				$scope.onlineUsers = [];
				$scope.offlineUsers = [];



				function requestChat(principalId, displayName, message) {
					//TODO: prevent two adds
					var windowScope = $scope.$new(false, $scope);

					windowScope.messages = [];

					windowScope.chatWindow = null;

					windowScope.peerOnline = true;

					windowScope.videochat = {
						opened: false,
						enabled: settings.SHOW_VIDEOCONFERENCE,
						pendingRequest: false
					};

					if (message) {
						windowScope.messages.push(message);
					}

					windowScope.chatInformation = {
						text: '',
						to: principalId
					};

					windowScope.sendVideoChatRequest = function () {
						var to = windowScope.chatInformation.to;
						var textToSend = videoChatMessages.REQUEST;

						chat.sendMessage(to, displayName, textToSend, window.currentUser.displayName);

						windowScope.startVideoChat();
					};

					windowScope.startVideoChat = function () {
						var to = btoa(windowScope.chatInformation.to.toLowerCase()).replace(/=/g,"");
						var from = btoa(window.currentUser.principalId.toLowerCase()).replace(/=/g,"");
						var chatroom;

						if (to < from ) {
							chatroom = 'room' + to + from;
						} else {
							chatroom = 'room' + from + to;
						}

						windowScope.videochat.room = "https://meet.eyeos.com/" + chatroom;
						if(settings.VIDEOCHAT_SERVER_DOCKERIZED) {
							windowScope.videochat.room = "/video/" + chatroom;
						}
						windowScope.videochat.opened = true;
						windowScope.openedInstances = 0;

						var appData = createVideoAppData(displayName, windowScope);

						appData.notifyWindowReady = function (window) {

							windowScope.openedInstances += 1;
							windowScope.videochat.opened = true;

							window.signals.on('closeDone', function (myWindow) {
								windowScope.openedInstances -= 1;

								if (windowScope.openedInstances === 0) {
									windowScope.videochat.opened = false;
								}
							});

						};

						$scope.$emit('openApp', appData)

					};

					windowScope.acceptVideoChatRequest = function (message) {

						if (!windowScope.videochat.opened) {
							windowScope.startVideoChat();
						}
						windowScope.videochat.pendingRequest = false;

						message.text = "Videoconference accepted.";
						message.showButtons = false;

						windowScope.sendMessage(videoChatMessages.ACCEPT);
					};

					windowScope.declineVideoChatRequest = function (message) {

						if (windowScope.videochat.opened) {
							windowScope.videochat.opened = false;
						}
						windowScope.videochat.pendingRequest = false;

						message.text = "Videoconference declined.";
						message.showButtons = false;

						windowScope.sendMessage(videoChatMessages.DECLINE);
					};

					windowScope.sendMessage = function(textToSend) {
						var to = windowScope.chatInformation.to;
						var from = window.currentUser.displayName;
						chat.sendMessage(to, displayName, textToSend, window.currentUser.displayName);
					};

					// send message to peer
					windowScope.sendToChat = function () {
						var to = windowScope.chatInformation.to;
						var from = window.currentUser.displayName;
						var textToSend = windowScope.chatInformation.text;

						if (textToSend === "") {
							return;
						}
						chat.sendMessage(to, displayName, textToSend, window.currentUser.displayName);
						windowScope.chatInformation.text = '';

						windowScope.messages.push(getOutgoingMessageInfo(from, textToSend));

						setTimeout(function () {
							chatWindowManager.showMessage(windowScope);
							chatWindowManager.adjustAndScroll(windowScope, windowScope.window);
						}, 0);
					};

					chatScopes[principalId] = windowScope;
					chatScopes[principalId].preventDelete = 0;

					var appData = createAppData(displayName, windowScope);

					// on new window ready
					appData.notifyWindowReady = function (window) {
						windowScope.chatWindow = window;
						chatScopes[principalId].window = window;
						chatScopes[principalId].preventDelete++;

						// on window resize or new popup
						window.signals.on('resize', function (myWindow) {

							setTimeout(function () {
								chatWindowManager.showMessage(chatScopes[principalId]);
								chatWindowManager.adjustAndScroll(chatScopes[principalId], myWindow);
								chatWindowManager.focus(chatScopes[principalId], myWindow);
							}, 0);
							DesktopBus.dispatch('chat.resizeEnd');
						});

						window.signals.on('resizeStart', function(myWindow) {
							DesktopBus.dispatch('chat.resizeStart');
						});

						// on window close complete
						window.signals.on('closeDone', function (myWindow) {
							if (chatScopes[principalId].videochat.pendingRequest) {
								chatScopes[principalId].sendMessage(videoChatMessages.DECLINE);
								chatScopes[principalId].videochat.pendingRequest = false;
							}

							if (chatScopes[principalId].preventDelete < 2) {
								delete chatScopes[principalId];
							} else {
								chatScopes[principalId].preventDelete--;
							}
						});

						setTimeout(function () {
							chatWindowManager.showMessage(chatScopes[principalId]);
							chatWindowManager.adjustAndScroll(chatScopes[principalId], window);
							chatWindowManager.focus(chatScopes[principalId], window);
						}, 0);
					};
					$scope.$emit('openApp', appData);
				}

				$scope.openChat = function (target, userInfo) {
					var principalId = userInfo.principalId;

					if (!principalId || !userInfo.online) {
						return;
					}
					var displayName = target.getAttribute('data-displayName');

					if (chatScopes[principalId]) {
						chatScopes[principalId].window.focus();
						chatWindowManager.focus(chatScopes[principalId], chatScopes[principalId].window);
					} else {
						requestChat(principalId, displayName);
					}
					$scope.closePanels();
				};

				function createAppData(displayName, windowScope) {
					var chatApp = new AppInfo("chatapp", $translate.instant("Chat with") + " " + displayName, "Chat", "eyeos_application");

					chatApp.setIsTemplateWindow(true);
					chatApp.setTplPath($scope.hooks.chat);
					chatApp.setTplScope(windowScope);
					chatApp.setSettings({
						minSize: {
							width: 300,
							height: 400
						}
					});
					return chatApp;
				}

				function createVideoAppData(displayName, windowScope) {
					var App = new AppInfo("Videoconferenceapp", $translate.instant("Videoconference with") + " " + displayName , "Chat", "eyeos_application");

					App.setIsTemplateWindow(true);
					App.setTplPath($scope.hooks.videoconference);
					App.setTplScope(windowScope);
					App.setSettings({
						minSize: {
							width: 700,
							height: 394
						}
					});
					return App;
				}


				var decodeEntities = (function () {

					// this prevents any overhead from creating the object each time
					var element = document.createElement('div');

					function decodeHTMLEntities(str) {
						if (str && typeof str === 'string') {
							// strip script/html tags
							str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
							str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
							element.innerHTML = str;
							str = element.textContent;
							element.textContent = '';
						}

						return str;
					}

					return decodeHTMLEntities;
				})();
			}]);
});
