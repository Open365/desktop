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

require.config({
	baseUrl: "scripts",
    paths: {
        "dependencyLoader": "./dependencyLoaderBuild",
        "modules": "../modules",
        "applications": '../modules/eyeApplications',
        "feedback": '../modules/feedback/feedback',
        "bower": "../../bower_components",
        "lodash": "../../bower_components/lodash/dist/lodash.compat",
        "conduitjs": "../../bower_components/conduitjs/lib/conduit",
        "eyeosAuthClient": "../../bower_components/eyeos-auth-client/build/eyeosAuthClient",
		"eyeosSchemes": "../../bower_components/eyeos-schemes/build-browser/eyeos-schemes"
    },
    findNestedDependencies: true,
    "wrap": true
});
