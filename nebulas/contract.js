/**
 * Created by cbuonocore on 5/13/18.
 * Nebulas contract for Liquidity betting platform.
 */

"use strict";

var Nebulas = require("./neb.js/index");

var Neb = Nebulas.Neb;
var neb = new Neb();
neb.setRequest(new Nebulas.HttpRequest("https://testnet.nebulas.io"));

// Created by the client application.
// {
// "symbol": XXXX, // commodity symbol
// "participants":[], // addresses of the participants
// "amounts": [], // bet amounts
// "sides": [], //
// "expirationDate": XXXX,
// "creationDate": XXXX
// }
const ContractItem = function (text, from) {
    const obj = JSON.parse(text);
    this.createdBy = from;
    this.symbol = obj.symbol;
    this.participants = obj.participants; // addresses of the participants
    this.amounts = obj.amounts; // bet amounts
    this.sides = obj.sides; //
    this.expirationDate = obj.expirationDate;
    this.creationDate = obj.creationDate;
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

var ContractRepository = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new ContractItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
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
