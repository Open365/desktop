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
	function FilesFeedbackFactory($translate) {
		this.$translate = $translate;
		this.baseUrl = location.protocol + "//" + location.host;
	}

	FilesFeedbackFactory.prototype.processAll = function (jobs) {
		var result = [];
		var self = this;

		jobs.forEach(function (job) {
			var res = self.process(job);
			if (res) {
				result.unshift(res);
			}
		});

		return result;
	};

	FilesFeedbackFactory.prototype.process = function (job) {
		var body = job.body,
			action = body && job.body.action,
			status = job.status;

		if (action === 'copy') {
			if (status === 'started') {
				return this._getCopyProgress(job);
			}

			if (status === 'error') {
				if (job.body.errorCode === 'overwrite') {
					return this._getCopyOverwriteError(job);
				} else {
					return this._getCopyError(job);
				}
			}

			if (status === 'created') {
				return this._getCopyCreated(job);
			}

			if (status === 'finished') {
				return this._getCopyFinished(job);
			}
		}

		if (action === 'move') {
			if (status === 'started') {
				return this._getMoveProgress(job);
			}

			if (status === 'error') {
				if (job.body.errorCode === 'overwrite') {
					return this._getMoveOverwriteError(job);
				} else {
					return this._getMoveError(job);
				}
			}

			if (status === 'created') {
				return this._getMoveCreated(job);
			}

			if (status === 'finished') {
				return this._getMoveFinished(job);
			}
		}

		if (action === 'compress') {
			if (status === 'created' || status === 'started') {
				return this._getDownloadStarted(job);
			}

			if (status === 'finished') {
				return this._getDownloadFinished(job);
			}

			if (status === 'error') {
				return this._getDownloadError(job);
			}
		}
	};

	FilesFeedbackFactory.prototype._getCopyOverwriteError = function (job) {
		var filename = job.body.source.split('/').pop();
		var message = this.$translate.instant("Error: An element with name {{fileName}} already exists", {fileName: filename});

		return {
			id: job.id,
			message: message,
			class: "error copy",
			buttons: [{
				classname: "cancel_button",
				label: "Cancel",
				action: "deleteFeedback"
			}, {
				classname: "overwrite_button",
				label: "Overwrite",
				action: "copy_overwrite"
			}]
		};
	};

	FilesFeedbackFactory.prototype._getCopyError = function (job) {
		var message = this.$translate.instant("Error copying {{source}} to {{target}}: {{errorCode}}", job.body);

		return {
			id: job.id,
			message: message,
			class: "error copy",
			buttons: [{
				classname: "ok_button",
				label: "Ok",
				action: "deleteFeedback"
			}]
		};
	};

	FilesFeedbackFactory.prototype._getCopyProgress = function (job) {
		var message = this.$translate.instant("Copying {{source}} to {{target}}.", job.body);

		return {
			id: job.id,
			message: message,
			class: "started copy"
		};
	};

	FilesFeedbackFactory.prototype._getCopyCreated = function (job) {
		var message = this.$translate.instant("Starting copy {{source}} to {{target}}.", job.body);

		return {
			id: job.id,
			message: message,
			class: "created copy"
		};
	};

	FilesFeedbackFactory.prototype._getCopyFinished = function (job) {
		var message = this.$translate.instant("Finished copying {{source}} to {{target}}.", job.body);

		return {
			id: job.id,
			message: message,
			class: "finished copy",
			buttons: [{
				classname: "ok_button",
				label: "Ok",
				action: "deleteFeedback"
			}]
		};
	};

	FilesFeedbackFactory.prototype._getMoveProgress = function (job) {
		var message = this.$translate.instant("Moving {{source}} to {{target}}.", job.body);

		return {
			id: job.id,
			message: message,
			class: "started move"
		};
	};

	FilesFeedbackFactory.prototype._getMoveOverwriteError = function (job) {
		var filename = job.body.source.split('/').pop();
		var message = this.$translate.instant("Error: An element with name {{fileName}} already exists", {fileName: filename});

		return {
			id: job.id,
			message: message,
			class: "error move",
			buttons: [{
				classname: "cancel_button",
				label: "Cancel",
				action: "deleteFeedback"
			}, {
				classname: "overwrite_button",
				label: "Overwrite",
				action: "move_overwrite"
			}]
		};
	};

	FilesFeedbackFactory.prototype._getMoveError = function (job) {
		var message = this.$translate.instant("Error moving {{source}} to {{target}}: {{errorCode}}", job.body);

		return {
			id: job.id,
			message: message,
			class: "error move",
			buttons: [{
				classname: "ok_button",
				label: "Ok",
				action: "deleteFeedback"
			}]
		};
	};

	FilesFeedbackFactory.prototype._getMoveCreated = function (job) {
		var message = this.$translate.instant("Starting move {{source}} to {{target}}.", job.body);

		return {
			id: job.id,
			message: message,
			class: "created move"
		};
	};

	FilesFeedbackFactory.prototype._getMoveFinished = function (job) {
		var message = this.$translate.instant("Finished moving {{source}} to {{target}}.", job.body);

		return {
			id: job.id,
			message: message,
			class: "finished move",
			buttons: [{
				classname: "ok_button",
				label: "Ok",
				action: "deleteFeedback"
			}]
		};
	};

	FilesFeedbackFactory.prototype._getDownloadFinished = function (job) {
		var message = this.$translate.instant("Download ready for {{path}}.", job.body);

		return {
			id: job.id,
			message: message,
			class: "finished compress",
			buttons: [{
				classname: "cancel_button",
				label: "Cancel",
				action: "deleteFeedback"
			}],
			links: [{
				classname: "download_button",
				label: "Download",
				url: this.baseUrl + job.body.url,
				download: job.body.filename,
				action: "deleteFeedback"
			}]
		};
	};

	FilesFeedbackFactory.prototype._getDownloadStarted = function (job) {
		var message = this.$translate.instant("Preparing to download {{path}}.", job.body);

		return {
			id: job.id,
			message: message,
			class: "started compress"
		};
	};

	FilesFeedbackFactory.prototype._getDownloadError = function (job) {
		var message = this.$translate.instant("Error while preparing to download {{path}}: {{errorCode}}", job.body);

		return {
			id: job.id,
			message: message,
			class: "error compress",
			buttons: [{
				classname: "ok_button",
				label: "Ok",
				action: "deleteFeedback"
			}]
		};
	};

	return FilesFeedbackFactory;
});
