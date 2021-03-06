"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * EOSIO MongoDB Fast Count
 *
 * @param {MongoClient} client MongoDB Client
 * @param {string} collectionName Collection Name
 * @param {object} [query={}] MongoDB Query
 * @param {object} [options={}] Optional Parameters
 * @param {number} [options.limit] Limit the maximum count
 * @param {number} [options.skip] Skips number of documents
 * @returns {Promise<Number>} Esimated Document Count
 * @example
 * const count = await count(client, "actions", {account: "eosio.token"});
 * count //=> 160000
 */
function count(client, collectionName, query = {}, options = {}) {
    const db = client.db("EOS");
    const collection = db.collection(collectionName);
    if (Object.keys(query).length) {
        return collection.countDocuments(query, options);
    }
    else {
        if (Object.keys(options).length) {
            return collection.estimatedDocumentCount(query, options);
        }
        else {
            return collection.estimatedDocumentCount(query);
        }
    }
}
exports.count = count;
