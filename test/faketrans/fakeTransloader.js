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

/*!
 * angular-translate - v2.6.0 - 2015-02-08
 * http://github.com/angular-translate/angular-translate
 * Copyright (c) 2015 ; Licensed MIT
 */
angular.module('pascalprecht.translate')
/**
 * @ngdoc object
 * @name pascalprecht.translate.$translateUrlLoader
 * @requires $q
 * @requires $http
 *
 * @description
 * Creates a loading function for a typical dynamic url pattern:
 * "locale.php?lang=en_US", "locale.php?lang=de_DE", "locale.php?language=nl_NL" etc.
 * Prefixing the specified url, the current requested, language id will be applied
 * with "?{queryParameter}={key}".
 * Using this service, the response of these urls must be an object of
 * key-value pairs.
 *
 * @param {object} options Options object, which gets the url, key and
 * optional queryParameter ('lang' is used by default).
 */
    .factory('$translateUrlLoader', ['$q', '$http', function ($q, $http) {

        return function (options) {
            var deferred = $q.defer(),
                requestParams = {};

            deferred.resolve({});

            return deferred.promise;
        };
    }]);
