"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * EOSIO MongoDB Blocks
 *
 * @param {MongoClient} client MongoDB Client
 * @param {Object} [options={}] Optional Parameters
 * @param {number} [options.limit=25] Limit the maximum amount of of actions returned
 * @param {number} [options.skip] Skips number of documents
 * @param {object} [options.sort] Sort by ascending order (1) or descending order (-1) (eg: {block_num: -1})
 * @param {object} [options.match] Match by entries (eg: {"block.producer": "eosio"})
 * @param {number} [options.block_num] Filter by exact Reference Block Number
 * @param {string} [options.block_id] Filter by exact Reference Block ID
 * @param {number} [options.lte_block_num] Filter by Less-than or equal (<=) the Reference Block Number
 * @param {number} [options.gte_block_num] Filter by Greater-than or equal (>=) the Reference Block Number
 * @returns {AggregationCursor<Blocks>} MongoDB Aggregation Cursor
 * @example
 * const options = {
 *     match: {"block.producer": "eosnationftw"},
 *     sort: {block_num: -1}
 * };
 * const results = await getBlocks(client, options);
 * console.log(await results.toArray());
 */
function getBlocks(client, options = {}) {
    // Setup MongoDB collection
    const db = client.db("EOS");
    const collection = db.collection("blocks");
    // MongoDB Pipeline
    const pipeline = [];
    // Default optional paramters
    const limit = utils_1.setDefaultLimit(options);
    // Match by data entries
    // options.match //=> {"data.from": "eosio"}
    if (options.match) {
        pipeline.push({ $match: options.match });
    }
    // Add block filters to Pipeline
    utils_1.addBlockFiltersToPipeline(pipeline, options);
    // Sort by ascending or decending based on attribute
    // options.sort //=> {block_num: -1}
    // options.sort //=> {"data.from": -1}
    if (options.sort) {
        pipeline.push({ $sort: options.sort });
    }
    // Support Pagination using Skip & Limit
    if (options.skip) {
        pipeline.push({ $skip: options.skip });
    }
    if (limit) {
        pipeline.push({ $limit: limit });
    }
    return collection.aggregate(pipeline);
}
exports.getBlocks = getBlocks;
