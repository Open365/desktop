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
	'utils/TemplateCompiler'
], function (TemplateCompiler) {
	function AppInfo(id, name, description, type, templateCompiler) {
		this.templateCompiler = templateCompiler || new TemplateCompiler();
		this.bigIcon = '';
		this.description = description;
		this.isVdi = false;
		this.name = name;
		this.settings = {
			minSize: {
				height: 300,
				width: 510
			}
		};
		this.showInDesktop = false;
		this.showInTab = false;
		this.smallIcon = '';
		this.tooltip = '';
		this.type = type;
		this.openType = 'attached_application';
		this.url = '';
		this.isTemplateWindow = false;
		this.tplPath = '';
		this.tplScope = null;
		this.isLoading = false;
		this.className = '';
		this.eyeWindow = null;
		this.multipleInstances = true;
		this.appID = id;
	}

	AppInfo.prototype.getInfo = function () {
		return {
			appID: this.appID,
			bigIcon: this.bigIcon,
			description: this.description,
			isVdi: this.isVdi,
			name: this.name,
			settings: this.settings,
			showInDesktop: this.showInDesktop,
			showInTab: this.showInTab,
			smallIcon: this.smallIcon,
			tooltip: this.tooltip,
			type: this.type,
			openType: this.openType,
			url: this.url,
			isTemplateWindow: this.isTemplateWindow,
			tplPath: this.tplPath,
			tplScope: this.tplScope,
			isLoading: this.isLoading,
			className: this.className,
			eyeWindow: this.eyeWindow,
			multipleInstances: this.multipleInstances
		};
	};

	AppInfo.prototype.replaceTemplate = function (templateName, callback) {
		var self = this;
		var tplFile = this.tplScope.hooks[templateName];
		this.setTplPath(tplFile);
		this.templateCompiler.compile(tplFile, this.tplScope, function(domElement) {
			self.eyeWindow.replaceContent($(domElement));
			callback();
		});
	};

	AppInfo.prototype.setBigIcon = function (bigIcon) {
		this.bigIcon = bigIcon;
	};

	AppInfo.prototype.setDescription = function (description) {
		this.description = description;
	};

	AppInfo.prototype.setIsVdi = function (isVdi) {
		this.isVdi = isVdi;
	};

	AppInfo.prototype.setName = function (name) {
		this.name = name;
	};

	AppInfo.prototype.setSettings = function (settings) {
		this.settings = settings;
	};

	AppInfo.prototype.setShowInDesktop = function (showInDesktop) {
		this.showInDesktop = showInDesktop;
	};

	AppInfo.prototype.setShowInTab = function (showInTab) {
		this.showInTab = showInTab;
	};

	AppInfo.prototype.setSmallIcon = function (smallIcon) {
		this.smallIcon = smallIcon;
	};

	AppInfo.prototype.setTooltip = function (tooltip) {
		this.tooltip = tooltip;
	};

	AppInfo.prototype.setType = function (type) {
		this.type = type;
	};

	AppInfo.prototype.setOpenType = function (openType) {
		this.openType = openType;
	};

	AppInfo.prototype.setUrl = function (url) {
		this.url = url;
	};

	AppInfo.prototype.setIsTemplateWindow = function (isTemplateWindow) {
		this.isTemplateWindow = isTemplateWindow;
	};

	AppInfo.prototype.setTplPath = function (tplPath) {
		this.tplPath = tplPath;
	};

	AppInfo.prototype.getTplPath = function () {
		return this.tplPath;
	};

	AppInfo.prototype.setTplScope = function (tplScope) {
		this.tplScope = tplScope;
	};

	AppInfo.prototype.setIsLoading = function (isLoading) {
		this.isLoading = isLoading;
	};

	AppInfo.prototype.setClassName = function (className) {
		this.className = className;
	};
	AppInfo.prototype.setEyeWindow = function (eyeWindow) {
		this.eyeWindow = eyeWindow;
	};

	AppInfo.prototype.setMultipleInstances = function (multipleInstances) {
		this.multipleInstances = multipleInstances;
	};

	return AppInfo;
});
