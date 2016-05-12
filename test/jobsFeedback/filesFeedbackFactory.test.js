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
	'modules/jobsFeedback/filesFeedbackFactory'
], function (FilesFeedbackFactory) {
	suite("FilesFeedbackFactory", function () {
		var sut, jobs, translate, standardJob, translateObj, baseUrl;

		setup(function () {
			baseUrl = "fakeUrl";
			standardJob = {
				id: "foo",
				status: "started",
				body: {
					action: "copy",
					source: "source",
					target: "target"
				}
			};

			translate = sinon.stub();

			translateObj = {
				instant: translate
			};
			sut = new FilesFeedbackFactory(translateObj);
			sut.baseUrl = baseUrl;
		});

		teardown(function () {

		});

		suite("#processAll", function () {
			test("calls $translate with the message and the job data when copy progress", function () {
				sut.processAll([standardJob]);

				sinon.assert.calledWithExactly(translate, "Copying {{source}} to {{target}}.", standardJob.body);

			});

			test("returns a feedback obj for each valid files job", function () {
				translate.returns("Copying source to target.");
				jobs = [standardJob, {}, standardJob];

				var expected = {
					id: standardJob.id,
					message: "Copying source to target.",
					class: "started copy"
				};

				var result = sut.processAll(jobs);

				assert.deepEqual(result, [expected, expected]);
			});

			test("calls $translate with the message and the job data when overwrite copy error", function () {
				var filename = "source";
				standardJob.status = "error";
				standardJob.body.errorCode= "overwrite";
				standardJob.body.source= "path/to/" + filename;

				sut.processAll([standardJob]);

				sinon.assert.calledWithExactly(translate, "Error: An element with name {{fileName}} already exists", {fileName: filename});

			});

			function testMessageWithOk(action, status) {
				var msg = "fakeMessage";

				translate.returns(msg);

				standardJob.body.action = action;
				standardJob.status = status;

				jobs = [standardJob];

				var expected = {
					id: standardJob.id,
					message: msg,
					class: status + " " + action,
					buttons: [{
						classname: "ok_button",
						label: "Ok",
						action: "deleteFeedback"
					}]
				};

				var result = sut.processAll([standardJob]);
				assert.deepEqual(result, [expected]);
			}

			function testStandardMessage (action, status) {
				var msg = "fakeMessage";

				translate.returns(msg);

				standardJob.body.action = action;
				standardJob.status = status;

				jobs = [standardJob];

				var expected = {
					id: standardJob.id,
					message: msg,
					class: status + " " + action
				};

				var result = sut.processAll([standardJob]);

				assert.deepEqual(result, [expected]);
			}

			['copy', 'move'].forEach(function (action) {
				test("returns a " + action + " progress feedback when action is " + action + " and status is started", function () {
					testStandardMessage(action, "started");
				});

				test("returns a " + action + " overwrite error feedback when action is "
						+ action + ", status is error and error code is overwrite", function () {
					var msg = "fakeMessage";

					translate.returns(msg);

					standardJob.body.action = action;
					standardJob.body.errorCode = "overwrite";
					standardJob.status = "error";

					var expected = {
						id: standardJob.id,
						message: msg,
						class: "error " + action,
						buttons: [{
							classname: "cancel_button",
							label: "Cancel",
							action: "deleteFeedback"
						}, {
							classname: "overwrite_button",
							label: "Overwrite",
							action: action + "_overwrite"
						}]
					};

					var result = sut.processAll([standardJob]);

					assert.deepEqual(result, [expected]);
				});

				test("returns a " + action + " created feedback when action is " + action + " and status is created", function () {
					testStandardMessage(action, "created");
				});

				test("returns a " + action + " finished feedback when action is " + action + " and status is finished", function () {
					testMessageWithOk(action, "finished");
				});

				test("returns a " + action + " generic error feedback when action is "
				+ action + ", status is error and error code is unknown", function () {
					standardJob.body.errorCode = "unknown";
					testMessageWithOk(action, "error");
				});
			});

			test("returns a download progress when action is copmpress and status is created", function () {
				var msg = "fakeMessage";

				translate.returns(msg);
				var action = "compress";
				standardJob.body.action = action;
				standardJob.status = "created";

				var expected = {
					id: standardJob.id,
					message: msg,
					class: "started " + action
				};

				var result = sut.processAll([standardJob]);

				assert.deepEqual(result, [expected]);
			});

			test("returns a download error when action is compress and status is error", function () {
				standardJob.body.errorCode = "unknown";
				testMessageWithOk('compress', "error");
			});

			test("returns a download success when action is compress and status is finished", function () {
				var msg = "fakeMessage";
				var filename = "fakeFilename";
				var url = "fakeUrl";

				translate.returns(msg);

				standardJob.body.action = "compress";
				standardJob.body.url = url;
				standardJob.body.filename= filename;
				standardJob.status = "finished";

				var expected = {
					id: standardJob.id,
					message: msg,
					class: "finished compress",
					buttons: [{
						classname: "cancel_button",
						label: "Cancel",
						action: "deleteFeedback"
					}],
					links: [{
						classname: "download_button",
						label: "Download",
						url: baseUrl + url,
						download: filename,
						action: "deleteFeedback"
					}]
				};

				var result = sut.processAll([standardJob]);
				assert.deepEqual(result, [expected]);
			});
		});
	});
});
