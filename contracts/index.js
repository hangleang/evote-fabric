/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const evote_contract = require('./lib/evote_contract.js');

module.exports.EvoteContract = evote_contract;
module.exports.contracts = [evote_contract];
