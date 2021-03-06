"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const getActions_1 = require("./getActions");
/**
 * Get Account Details
 *
 * @param {MongoClient} client MongoDB Client
 * @param {string} name Account Name
 * @param {Object} [options={}] Optional Parameters
 * @param {number} [options.lte_block_num] Filter by Less-than or equal (<=) the Reference Block Number
 * @returns {Object} Account Details
 * @example
 * const name = "eosnationftw";
 * const options = {
 *   block_num: 6000000,
 * };
 * const result = await getAccount(client, name, options);
 * // {
 * //   name: 'eosnationftw',
 * //   block_num: 2092984,
 * //   stake_quantity: 1.8,
 * //   stake_net_quantity: 0.9,
 * //   stake_cpu_quantity: 0.9,
 * //   actions: [...Actions]
 * // }
 */
function getAccount(client, name, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get Actions
        const actions = yield getActions_1.getActions(client, {
            account: "eosio",
            name: ["delegatebw", "undelegatebw"],
            match: { $or: [{ "data.from": name }, { "data.receiver": name }] },
            lte_block_num: options.lte_block_num,
            irreversible: true,
            limit: Infinity,
        }).toArray();
        // Assert
        if (!actions.length) {
            throw new Error("no account found");
        }
        // Counters
        let block_num = 0;
        let stake_quantity = 0;
        let stake_net_quantity = 0;
        let stake_cpu_quantity = 0;
        for (const action of actions) {
            if (action.block_num > block_num) {
                block_num = action.block_num;
            }
            switch (action.name) {
                // Add total stake
                case "delegatebw":
                    if (name === action.data.receiver) {
                        const stake_net_quantity_number = Number(action.data.stake_net_quantity.replace(" EOS", ""));
                        const stake_cpu_quantity_number = Number(action.data.stake_cpu_quantity.replace(" EOS", ""));
                        stake_net_quantity += stake_net_quantity_number;
                        stake_cpu_quantity += stake_cpu_quantity_number;
                        stake_quantity += stake_net_quantity_number + stake_cpu_quantity_number;
                    }
                    break;
                // Remove total stake
                case "undelegatebw":
                    if (name === action.data.from) {
                        const unstake_net_quantity_number = Number(action.data.unstake_net_quantity.replace(" EOS", ""));
                        const unstake_cpu_quantity_number = Number(action.data.unstake_cpu_quantity.replace(" EOS", ""));
                        stake_net_quantity -= unstake_net_quantity_number;
                        stake_cpu_quantity -= unstake_cpu_quantity_number;
                        stake_quantity -= unstake_net_quantity_number + unstake_cpu_quantity_number;
                    }
                    break;
            }
        }
        // Round to 4 decimals
        stake_quantity = Number(stake_quantity.toFixed(4));
        return {
            name,
            block_num,
            stake_quantity,
            stake_net_quantity,
            stake_cpu_quantity,
            actions,
        };
    });
}
exports.getAccount = getAccount;
