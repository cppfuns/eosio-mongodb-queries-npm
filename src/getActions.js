"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * EOSIO MongoDB Actions
 *
 * @param {MongoClient} client MongoDB Client
 * @param {Object} [options={}] Optional Parameters
 * @param {string|Array<string>} [options.account] Filter by account contracts (eg: ["eosio","eosio.token"])
 * @param {string|Array<string>} [options.name] Filter by action names (eg: ["undelegatebw", "delegatebw"])
 * @param {number} [options.limit=25] Limit the maximum amount of of actions returned
 * @param {number} [options.skip] Skips number of documents
 * @param {object} [options.sort] Sort by ascending order (1) or descending order (-1) (eg: {block_num: -1})
 * @param {object} [options.match] Match by entries using MongoDB's $match (eg: {"data.from": "eosio"})
 * @param {string} [options.trx_id] Filter by exact Transaction Id
 * @param {boolean} [options.irreversible] Irreversible transaction (eg: true/false)
 * @param {number} [options.block_num] Filter by exact Reference Block Number
 * @param {string} [options.block_id] Filter by exact Reference Block ID
 * @param {number} [options.lte_block_num] Filter by Less-than or equal (<=) the Reference Block Number
 * @param {number} [options.gte_block_num] Filter by Greater-than or equal (>=) the Reference Block Number
 * @returns {AggregationCursor<Action>} MongoDB Aggregation Cursor
 * @example
 * const options = {
 *     account: "eosio",
 *     name: ["delegatebw", "undelegatebw"],
 *     match: {"act.data.from": "eosnationftw", "act.data.receiver": "eosnationftw"},
 *     irreversible: true,
 *     sort: {block_num: -1}
 * };
 * const results = await getActions(client, options);
 * console.log(await results.toArray());
 */
function getActions(client, options = {}) {
    // Setup MongoDB collection
    const db = client.db("EOS");
    const collection = db.collection("action_traces");
    // Default optional paramters
    const limit = utils_1.setDefaultLimit(options);
    // Convert (string|string[]) => string[]
    const names = Array.isArray(options.name) ? options.name : options.name ? [options.name] : [];
    const accounts = Array.isArray(options.account) ? options.account : options.account ? [options.account] : [];
    // MongoDB Pipeline
    const pipeline = [];
    // Filter by Transaction ID
    if (options.trx_id) {
        pipeline.push({ $match: { trx_id: options.trx_id } });
    }
    // Filter account contracts
    // eg: ["eosio", "eosio.token"]
    if (accounts.length) {
        pipeline.push({
            $match: {
                $or: accounts.map((account) => {
                    return { "act.account": account };
                }),
            },
        });
    }
    // Filter action names
    // eg: ["delegatebw", "undelegatebw"]
    if (names.length) {
        pipeline.push({
            $match: {
                $or: names.map((name) => {
                    return { "act.name": name };
                }),
            },
        });
    }
    // Match by data entries
    // options.match //=> {"data.from": "eosio"}
    if (options.match) {
        pipeline.push({ $match: options.match });
    }
    // Get Reference Block Number from Transaction Id
    pipeline.push({
        $graphLookup: {
            from: "transactions",
            startWith: "$trx_id",
            connectFromField: "trx_id",
            connectToField: "trx_id",
            as: "transactions",
        },
    });
    // Add block_num + block_id and other fields
    pipeline.push({
        $project: {
            // action_traces
            _id: 1,
            act: 1,
            trx_id: 1,
            // join transactions
            irreversible: { $arrayElemAt: ["$transactions.irreversible", 0] },
            block_id: { $arrayElemAt: ["$transactions.block_id", 0] },
            block_num: { $arrayElemAt: ["$transactions.block_num", 0] },
        },
    });
    // Add block filters to Pipeline
    utils_1.addBlockFiltersToPipeline(pipeline, options);
    // Sort by ascending or decending based on attribute
    // options.sort //=> {block_num: -1}
    // options.sort //=> {"act.data.from": -1}
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
exports.getActions = getActions;
