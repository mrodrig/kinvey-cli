/**
 * Copyright (c) 2018, Kinvey, Inc. All rights reserved.
 *
 * This software is licensed to you under the Kinvey terms of service located at
 * http://www.kinvey.com/terms-of-use. By downloading, accessing and/or using this
 * software, you hereby accept such terms of service  (and any agreement referenced
 * therein) and agree that you have read, understand and agree to be bound by such
 * terms of service and are of legal age to agree to such terms with Kinvey.
 *
 * This software contains valuable confidential and proprietary information of
 * KINVEY, INC and is subject to applicable licensing agreements.
 * Unauthorized reproduction, transmission or distribution of this file and its
 * contents is a violation of applicable laws.
 */

const async = require('async');

const { ConfigType } = require('./Constants');
const { getConfigTypeError, readJSON } = require('./Utils');

class ConfigFileProcessor {
  constructor(options) {
    this.envProcessor = options.envFileProcessor;
  }

  /**
   * Processes a config file.
   * @param {Object} options
   * @param {String} options.file File path
   * @param {Constants.OperationType} options.operationType
   * @param {Constants.ConfigType} options.configType - The expected config type.
   * @param {String} [options.name] - Name of entity to create.
   * @param done
   */
  process(options, done) {
    async.waterfall([
      (next) => {
        readJSON(options.file, next);
      },
      (parsedData, next) => {
        options.parsedData = parsedData;
        const expectedConfigType = options.configType;
        const actualConfigType = parsedData.configType;
        if (expectedConfigType !== actualConfigType) {
          const errMsg = `You have specified the wrong type of config file. Expected: ${expectedConfigType}`;
          return setImmediate(() => next(new Error(errMsg)));
        }

        if (actualConfigType === ConfigType.ENV) {
          this.envProcessor.process(options, next);
        } else {
          return setImmediate(() => next(getConfigTypeError(actualConfigType)));
        }
      }
    ], done);
  }
}

module.exports = ConfigFileProcessor;