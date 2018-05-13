/**
 * Created by cbuonocore on 5/13/18.
 */
const fs = require('fs');

const nebulas = require('./neb.js/index');
const Account = nebulas.Account;
const neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));

const api = neb.api;
api.getTransactionReceipt({hash: "cc7133643a9ae90ec9fa222871b85349ccb6f04452b835851280285ed72b008c"}).then(function(receipt) {
//code
});

const contractAddress = "n21HfxpxAx3usVXHUGygo6J9XPxFZJCN5uJ";

function submitContract(contract, nonce) {
    console.log(contract, nonce);
    const Transaction = nebulas.Transaction;
    const tx = new Transaction({
        chainID: 1001,
        from: acc,
        to: contractAddress,
        value: 0,
        nonce: parseInt(nonce) + 1,
        gasPrice: 1000000,
        gasLimit: 2000000,
        contract: {
            function: "saveItem",
            // args: `['${JSON.stringify(contract)}']`
            args: `[{}]`
        }
    });

    tx.signTransaction();
    const txHash = tx.hash.toString("hex");
    console.log("hash:" + txHash);
    console.log("sign:" + tx.sign.toString("hex"));
    console.log('proto', tx.toProtoString());
    api.sendRawTransaction( {data: tx.toProtoString()} ).then(function(hash) {
        console.log(hash);
        return hash;
    });
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
    const contract = {'symbol': "hi"};
    const hash = submitContract(contract, state.nonce);
    console.log('hash', hash);
}).catch(function (err) {
    console.log(err);
});

