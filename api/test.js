/**
 * Created by cbuonocore on 5/13/18.
 */
const fs = require('fs');

const Nebulas = require("./neb.js/index");
const Account = Nebulas.Account;
const Neb = Nebulas.Neb;
const neb = new Neb();
neb.setRequest(new Nebulas.HttpRequest("https://testnet.nebulas.io"));

const contractAddress = "n21HfxpxAx3usVXHUGygo6J9XPxFZJCN5uJ";

function submitContract(contract, nonce) {
    console.log(contract, nonce);
    const Transaction = Nebulas.Transaction;
    const tx = new Transaction({
        chainID: 1001,
        from: acc,
        to: contractAddress,
        value: 0,
        nonce: parseInt(nonce) + 1,
        gasPrice: '1000000',
        gasLimit: '2000000',
        contract: {
            function: "saveItem",
            args: `[${JSON.stringify(contract)}]`
        }
    });

    tx.signTransaction();
    const txHash = tx.hash.toString("hex");
    console.log("hash:" + txHash);
    console.log("sign:" + tx.sign.toString("hex"));
    console.log(tx.toString());
    const data = tx.toProtoString();
    console.log(data);
    tx.fromProto(data);
    console.log(tx.toString());
    console.log("address:" + tx.from.getAddressString());
    return txHash;
}

const PASS = process.env.NEB_WALLET || 'testing123';
const CONTRACT_ADDRESS = "n21HfxpxAx3usVXHUGygo6J9XPxFZJCN5uJ";

const MY_ADDRESS = "n1WJ8UCirPdMmLMYiuemHuUp9xftqkunQCu";
const v4 = JSON.parse(fs.readFileSync(`./${MY_ADDRESS}.json`));
console.log(v4);
let acc = new Account();
acc = acc.fromKey(v4, PASS, true);

neb.api.getAccountState(MY_ADDRESS).then(function (state) {
    console.log(state);
    const contract = {};
    const hash = submitContract(contract, state.nonce);
    console.log('hash', hash);
}).catch(function (err) {
    console.log(err);
});

