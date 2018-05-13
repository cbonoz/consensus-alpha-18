/**
 * Created by cbuonocore on 5/13/18.
 * Nebulas contract for Liquidity betting platform.
 */

"use strict";

// Created by the client application.
// {
// "symbol": "CRDUSD, // commodity symbol.
// "endPrice": $55.00, // end price.
// "participants":[XXXX, ...], // addresses of the participants (use index for corresponding amount and side).
// "amounts": [1.00, ...], // bet amounts in NAS
// "sides": [1, ...], // 1 if above, 0 if below
// "expirationDate": XXXX // timestamp when the price will be checked.
// }
const ContractItem = function (text, from) {
    const obj = JSON.parse(text);
    this.symbol = obj.symbol;
    this.endPrice = obj.endPrice;
    this.participants = obj.participants; // addresses of the participants
    this.amounts = obj.amounts; // bet amounts
    this.sides = obj.sides; //
    this.expirationDate = obj.expirationDate;

    this.createdBy = from;
    this.creationDate = new Date().getTime();
};

// Created by the server.
// {
// "contractTx": XXXX,
// "participants":[], // addresses of the participants
// "payouts": [], // bet amounts
// }
const ContractResult = function (text, from) {
    const obj = JSON.parse(text);
    this.createdBy = from;
    this.contractTx = obj.contractTx;
    this.participants = obj.participants; // addresses of the participants
    this.payouts = obj.payouts; // bet payouts
};

ContractItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

const ContractRepository = function () {
    // LocalContractStorage.defineMapProperty(this, "repo", {
    //     parse: function (text) {
    //         return new ContractItem(text);
    //     },
    //     stringify: function (o) {
    //         return o.toString();
    //     }
    // });
};

ContractRepository.prototype = {
    init: function () {

    },
    saveItem: function(contract) {
        const from = Blockchain.transaction.from;
        const contractItem = new ContractItem(contract, from);
        Event.Trigger("contractItem", contractItem);
    },
    saveResult: function(result) {
        const from = Blockchain.transaction.from;
        const contractItem = new ContractResult(result, from);
        Event.Trigger("contractResult", contractItem);
    }
};
module.exports = ContractRepository;
