/*
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const BuildCommand = require('./build');
const Controller = require('../lib/controller');
const {ExitCode} = require('../lib/constants');

module.exports = {
  async runAsync() {
    await BuildCommand.runAsync();
    const controller = new Controller();
    /** @type {!mdc.proto.ReportData} */
    const reportData = await controller.initForCapture();
    await controller.uploadAllAssets(reportData);
    await controller.captureAllPages(reportData);
    await controller.compareAllScreenshots(reportData);
    await controller.generateReportPage(reportData);

    const numChanges =
      reportData.screenshots.changed_screenshot_list.length +
      reportData.screenshots.added_screenshot_list.length +
      reportData.screenshots.removed_screenshot_list.length;
    if (numChanges > 0) {
      console.error(`\n${numChanges} screenshots changed!`);
      return ExitCode.CHANGES_FOUND;
    }
  },
};
