"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
/**
 * Set default limit
 *
 * @param {object} [options={}] Optional Parameters
 * @returns {number} Default Limit value
 * @example
 * setDefaultLimit() //=> 25
 */
function setDefaultLimit(options = {}) {
    return util_1.isNullOrUndefined(options.limit) ? 25 :
        (options.limit === Infinity || options.limit === -1) ? null : options.limit;
}
exports.setDefaultLimit = setDefaultLimit;
/**
 * Add Block Filters to Pipeline
 *
 * @param {object[]} pipeline MongoDB Pipeline
 * @param {object} [options={}] Optional Parameters
 * @param {boolean} [options.irreversible] Irreversible transaction (eg: true/false)
 * @param {number} [options.block_num] Filter by exact Reference Block Number
 * @param {string} [options.block_id] Filter by exact Reference Block ID
 * @param {number} [options.lte_block_num] Filter by Less-than or equal (<=) the Reference Block Number
 * @param {number} [options.gte_block_num] Filter by Greater-than or equal (>=) the Reference Block Number
 * @returns {void} Appends results to pipeline
 */
function addBlockFiltersToPipeline(pipeline, options = {}) {
    const { block_id, block_num, lte_block_num, gte_block_num, irreversible } = options;
    // Irreversible
    if (irreversible) {
        pipeline.push({ $match: { irreversible } });
    }
    // Block ID
    if (block_id) {
        pipeline.push({ $match: { block_id } });
    }
    // Block Number
    if (!util_1.isNullOrUndefined(block_num)) {
        pipeline.push({ $match: { block_num } });
    }
    // Both greater & lesser Block Number
    if (!util_1.isNullOrUndefined(lte_block_num) && !util_1.isNullOrUndefined(gte_block_num)) {
        pipeline.push({ $match: { block_num: { $lte: lte_block_num, $gte: gte_block_num } } });
    }
    else {
        if (!util_1.isNullOrUndefined(lte_block_num)) {
            pipeline.push({ $match: { block_num: { $lte: lte_block_num } } });
        }
        if (!util_1.isNullOrUndefined(gte_block_num)) {
            pipeline.push({ $match: { block_num: { $gte: gte_block_num } } });
        }
    }
}
exports.addBlockFiltersToPipeline = addBlockFiltersToPipeline;
