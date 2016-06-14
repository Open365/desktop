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
    'settings',
    'urlConfig',
    'modules/cloudApp/spiceConnector'
], function (settings, urlConfig, SpiceConnector) {
    angular.module('cloudApp', [])
        .controller('cloudAppController', ['$scope', 'eyeosVdiReconnectionService', '$window',
            function ($scope, eyeosVdiReconnectionService, $window) {
                settings.CONNECT_TO_CHAT = false;

                var appName = ['open365'];
                try {
                    appName = JSON.parse(urlConfig.app);
                } catch (err) {
                    // user modified the URL so it's not JSON valid anymore, well duh
                }
                var appNameFile = appName[0].toLowerCase();
                $("link[rel='icon']").remove();
                $("link[rel='manifest']").after('<link rel="icon" type="image/png" href="/images/favicon/' + appNameFile +  '-16x16.png" sizes="16x16">')
                    .after('<link rel="icon" type="image/png" href="/images/favicon/' + appNameFile +  '-32x32.png" sizes="32x32">')
                    .after('<link rel="icon" type="image/png" href="/images/favicon/' + appNameFile +  '-96x96.png" sizes="96x96">')
                    .after('<link rel="icon" type="image/png" href="/images/favicon/' + appNameFile +  '-192x192.png" sizes="192x192">');

                var openedApp = appName[0].charAt(0).toUpperCase() + appName[0].slice(1);
                window.eyeosIgnoreConfirmation = !(openedApp === 'Mail');

                window.DesktopBus.dispatch('app.opened', {name: appNameFile});

                var spiceConnector = new SpiceConnector(encodeURIComponent(urlConfig.app), eyeosVdiReconnectionService);
                spiceConnector.connect();

                if($window.settingsStatic.EYEOS_DISABLE_ANALYTICS === false) {
                    ga('send', 'event', 'Application', 'Opened', openedApp);
                    ga('send', 'pageview', document.location.pathname);
                }
            }]);
});
