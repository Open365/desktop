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
	'appModule',
	'utils/desktopBus',
	'desktop/desktopAppsOpenerService',
	'peopleGroups/peopleGroups',
	'desktop/loading/loadingService',
	'desktop/loading/loadingListController',
	'utils/Downloader',
	'utils/Uploader',
	'utils/ErrorDialog',
	'utils/modal/eyeAlertFactory',
	'modules/eyeApplications/ViewerFactory',
	'desktop/desktopResizeEmitter',
	'modules/eyeApplications/VdiAppFactory',
	'desktop/desktopUnloadEmitter',
	'desktop/desktopBeforeUnloadEmitter',
	'desktop/desktopMoveEmitter'
], function(AppModule, DesktopBus, OpenAppsServiceRef, peopleGroups, loadingService, loadingListController, Downloader, Uploader, ErrorDialog) {
	angular.module('eyeDesktopApp')
		.service('OpenAppsService', ['LoadingService', OpenAppsServiceRef])
		.service('LoadingService', ['WindowInfoFactory', loadingService])
		.controller('LoadingListController', ['$scope', 'LoadingService', loadingListController])

		.controller('DesktopController', ['$translate', '$scope', 'EyeAlertFactory', 'ViewerFactory',
			'OpenAppsService', 'VdiAppFactory', 'SETTINGS', 'desktopMoveEmitter', 'WindowManagerService', 'ApplicationsService',
			function ($translate, $scope, EyeAlertFactory, ViewerFactory, openAppsService, VdiAppFactory,
			          settings, desktopMoveEmitter, windowManagerService, applicationsService) {
				$scope.settings = settings;
				$scope.windows = openAppsService.openedApps;
				$scope.loadingApps = openAppsService.loadingApps;
				$scope.alerts = [];

				var subscriptions = [];

				subscriptions.push(DesktopBus.subscribe("displayAlert", function (data, envelope) {
					$scope.alerts.push(EyeAlertFactory.constructFromData(data));
					$scope.$apply();
				}, this));

				subscriptions.push(DesktopBus.subscribe("openFileViewerPopup", function (data) {
					var app = ViewerFactory.getApp(data);
					app.setOpenType('detached_application');
					openApp({}, app);
					$scope.$apply();
				}, this));

				subscriptions.push(DesktopBus.subscribe("openFileViewer", function(data, envelope) {
					var app = ViewerFactory.getApp(data);
					openApp({}, app);
					$scope.$apply();
				}, this));

				subscriptions.push(DesktopBus.subscribe("openVdiFile", function(data, envelope) {
					var app = VdiAppFactory.getApp(data);
					openApp({}, app);
					$scope.$apply();
				}, this));

				subscriptions.push(DesktopBus.subscribe("openVdiFilePopup", function (data) {
					var app = VdiAppFactory.getApp(data);
					app.setOpenType('detached_application');
					openApp({}, app);
					$scope.$apply();
				}, this));

				subscriptions.push(DesktopBus.subscribe('windowCreate', function(app) {
					openAppsService.openVDIWindow(app, $scope.$apply.bind($scope));
				}, openAppsService));

				subscriptions.push(DesktopBus.subscribe('applicationLauncherWrongAppPathError', function (data) {
					console.error('Wrong application path');
				}));

				subscriptions.push(DesktopBus.subscribe('push.userRemovedFromWorkgroup', function (data) {
					$scope.$broadcast('currentUserRemovedFromGroup', data.workgroupId);
				}));
				subscriptions.push(DesktopBus.subscribe('push.workgroupDeleted', function (data) {
					$scope.$broadcast('currentUserRemovedFromGroup', data.workgroupId);
				}));

				subscriptions.push(DesktopBus.subscribe('fileDownload', function (data) {
					var downloader = new Downloader($translate);
					downloader.start('/userfiles/' + data.path);
				}));

				subscriptions.push(DesktopBus.subscribe('fileDownloadNewTab', function (data) {
					var downloader = new Downloader($translate);
					downloader.setNewTabStrategy();
					downloader.start('/userfiles/' + data.path);
				}));

				subscriptions.push(DesktopBus.subscribe('fileUpload', function (data) {
					// FIXME: Do permission checks
					//if (!this.checkWritePermission(selection, dir) || !config['upload-file'])
					//	return;

					var downloader = new Downloader($translate);
					downloader.getDonwloadUrl('/userfiles/' + data.path, function (data, status) {
						if (status === 'success') {
							var uploader = new Uploader();
							uploader.open(data.url);

						} else {
							var dialog = new ErrorDialog($translate.instant('Upload error'), $translate.instant('An error has occurred with the upload'));
							dialog.show();
						}
					}, function () {
						var dialog = new ErrorDialog($translate.instant('Upload error'), $translate.instant('An error has occurred with the upload'));
						dialog.show();
					});
				}));

				var dialogOpened = false;
				subscriptions.push(DesktopBus.subscribe("fileChooser.open", function (id) {

					if (!dialogOpened) {
						applicationsService.getApplicationByName('Files', function (app) {

							app = angular.copy(app);
							app.url += "#filesMode=fileChooser&filechooserId=" + id + "&viewMode=list";

							var $dialogContent = $('<iframe src="' + app.url + '"></iframe>');
							$dialogContent.attr('width', 800);
							$dialogContent.attr('height', 485);

							var subscription;
							var dialog = BootstrapDialog.show({
								cssClass: 'file-chooser-dialog',
								message: $dialogContent,
								onhidden: function (dialog) {
									subscription.unsubscribe();
								}
							});

							dialogOpened = true;

							subscription = DesktopBus.subscribe("fileChooser.close." + id, function () {
								$dialogContent.attr('src', "about:blank");
								dialog.close();
								dialogOpened = false;
							});

						});
					}
				}));


				$scope.unloadDesktop = function() {
					DesktopBus.dispatch('unloadDesktop');
				};

				$scope.unloadConfirmMsg = function() {
					if (!window.eyeosIgnoreConfirmation && document.title.indexOf('Mail') !== -1) {
						return "This action could make you lose unfinished work";
					}
				};

				$scope.closeApp = function (app) {
					openAppsService.closeApp(app);
					$scope.$apply();
				};

				function openApp(event, app) {
					closePanels();
					openAppsService.openApp(app, function (isVdi) {
						if (isVdi) {
							$scope.$broadcast('openLoading', app);
						}
					});

				}

				$scope.$on('openApp', openApp);

				$scope.$on('openAppDetached', function (ev, app) {
					app.openType = "detached_application";
					openApp(ev, app);
				});

				$scope.onDesktopResize = function (width, height) {
					var ventusWM = windowManagerService.getVentusManager();
					ventusWM.onDesktopResized(width, height);
				};

				$scope.$on('close-windows', function(event, args) {
					closePanels();
				});

				var peopleAlreadyInit = false;
				$scope.peopleGroupsEnabled = settings.PEOPLE_GROUPS_ENABLED;
				$scope.initPeopleGroups = function (id, $ev) {
					if(!peopleAlreadyInit) {
						peopleGroups();
						peopleAlreadyInit = true;
					}
					$scope.$broadcast('togglePeople');
					$scope.togglePanel(id, $ev);
				};

				var currentPanel = "";

				$scope.closePanels = function() {
					closePanels();
				};

				function closePanels () {
					currentPanel = "";
					$('.panel-content').removeClass('visible');
					$('.panel-button').removeClass('active');
				}

				function openPanel(id, $ev) {
					currentPanel = id;
					$('#' + id).addClass('visible');
					$($ev.currentTarget).addClass('active');
				}

				$scope.togglePanel = function (id, $ev) {
					var curr = currentPanel;
					closePanels();
					if (curr !== id) {
						openPanel(id, $ev);
					}
				};

				$scope.unsubscribe = function () {
					subscriptions.forEach(function (sub) {
						sub.unsubscribe();
					});
				};

			}]);

});
