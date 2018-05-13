// modules =================================================
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
// require('pretty-error').start();
const logger = require('./logger');
const app = express();
const getRawBody = require('raw-body');
const typer = require('media-typer');
const cluster = require('cluster');
const cors = require('cors')
const fs = require("fs");
const rimraf = require('rimraf');
const path = require('path');
const multer = require('multer');
const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');
const config = require('config');
const _ = require('lodash');
const redis = require('redis');
const WebSocket = require('ws');

const Nebulas = require("./neb.js/index");
const Account = Nebulas.Account;
const Neb = Nebulas.Neb;
const neb = new Neb();
neb.setRequest(new Nebulas.HttpRequest("https://testnet.nebulas.io"));

const PASS = process.env.NEB_WALLET || 'testing123';
const CONTRACT_ADDRESS = "n21HfxpxAx3usVXHUGygo6J9XPxFZJCN5uJ";

const MY_ADDRESS = "n1WJ8UCirPdMmLMYiuemHuUp9xftqkunQCu";
const v4 = JSON.parse(fs.readFileSync(`./${MY_ADDRESS}.json`));
console.log(v4);
let acc = new Account();
acc = acc.fromKey(v4, PASS, true);

neb.api.getAccountState(MY_ADDRESS).then(function (state) {
    console.log(state);
}).catch(function (err) {
    console.log(err);
});

AWS.config.update(
    {
        region: config.get('AWS.region')
    });
const wss = new WebSocket('wss://api_demo.alphapoint.com/WSGateway/');
redis_client = redis.createClient();
// redis_client.flushall()

wss.on('message', function incoming(message) {
    let msg = JSON.parse(message)
    if ("o" in msg) {
        try {
            msg['o'] = JSON.parse(msg["o"])
        } catch (e) {
            logger.warn("Could Not parse Response")
        }

    }

    if ("n" in msg) {
        logger.debug("Received Message of type: " + msg["n"])
        if ((msg["n"] === "SubscribeTrades" || msg["n"] === "TradeDataUpdateEvent") && "o" in msg) {

            _.forEach(msg["o"], function (obj, idx) {
                const trade = {
                    TradeID: obj[0],
                    ProductPairCode: obj[1],
                    Quantity: obj[2],
                    Price: obj[3],
                    Order1: obj[4],
                    Order2: obj[5],
                    TradeTime: obj[5],
                    Direction: obj[6],
                    Order1Side: obj[7],
                    Order2Side: obj[8],
                }
                redis_client.hset("Trades:" + trade["ProductPairCode"], trade["TradeID"], JSON.stringify(trade, null));
            })

        }

    }
    logger.debug(JSON.stringify(msg, null, 4));

});

function doSend(msg) {
    wss.send(msg, function ack(error) {
        if (!error) {
            console.log("Success Sending Message")
        } else {
            console.log("Error")
        }
        // If error is not defined, the send has been completed, otherwise the error
        // object will indicate what failed.
    })
}

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Create a temporary directory for uploads.
    const tmpDir = '/tmp';
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }

    const port = process.env.PORT || 8000;

    fs.readdirSync(tmpDir).forEach((file) => {
        const file_path = tmpDir + path.sep + file
        if (fs.lstatSync(file_path).isDirectory() && file.includes("behold-api-")) {
            rimraf.sync(file_path);
            logger.debug('Removed temporary directory 🗑️	:' + file_path);
        }
    })

    const upload_dir = fs.mkdtempSync(tmpDir + path.sep + 'behold-api-');
    const process_env = {
        upload_dir: upload_dir,
        port: port
    }

    const cpuCount = require('os').cpus().length;

    logger.debug("✅	Starting " + cpuCount + " listener processes")

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        worker = cluster.fork(process_env);
    }

    // Listen for workers
    cluster.on('exit', function (worker) {
        // Replace the terminated workers
        logger.debug('Worker ' + worker.process.pid + ' died 💀');
        cluster.fork(process_env);
    });

    cluster.on('online', (worker) => {
        logger.debug('Started PID ⚡	: ' + worker.process.pid);
    })

    wss.on('open', function connection() {
        console.log("Connected!")
        // doSend(JSON.stringify({
        // 	n: "GetOMSs",
        // 	m : 0,
        // 	i : 0,
        // 	o : JSON.stringify({"OperatorId": 1})
        // }));
        // doSend(JSON.stringify({
        // 	n: "GetInstruments",
        // 	m : 0,
        // 	i : 2,
        // 	o : JSON.stringify({"OMSId": 1})
        // }));

        // doSend(JSON.stringify({
        // 	n: "SubscribeTicker",
        // 	m : 0,
        // 	i : 4,
        // 	o : JSON.stringify({
        // 		"OMSId": 1,
        // 		"InstrumentId" : 1,
        // 		"Interval" : 60,
        // 		"IncludeLastCount" : 100,
        // 	})
        // }));

        // doSend(JSON.stringify({
        // 	n: "CreateQuote",
        // 	m : 0,
        // 	i : 8,
        // 	o : JSON.stringify({
        // 		"OMSId": 1,
        // 		"AccountId" : 117,
        // 		"InstrumentId" : 7,
        // 		"Bid" : 100,
        // 		"BidQty" : 0,
        // 		"Ask" : 100,
        // 		"AskQty" : 0,
        // 	})
        // }));

        doSend(JSON.stringify({
            n: "SubscribeTrades",
            m: 0,
            i: 36,
            o: JSON.stringify({
                "OMSId": 1,
                "InstrumentId": 1,
                "IncludeLastCount": 100
            })
        }));

        // doSend(JSON.stringify({
        // 	n: "GetOrderHistory",
        // 	m : 0,
        // 	i : 26,
        // 	o : JSON.stringify({
        // 		"OMSId" : 1,
        // 		"AccountId" : 117,
        // 		"Depth" : 1000
        // 	})
        // }));
    });

    // Log to the user
    logger.info('Behold.ai API is served on port ⚓	: ' + port);

} else {

    const {upload_dir, common, request, port} = process.env

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, upload_dir);
        },
        filename: function (req, file, cb) {
            mimeType = file.mimetype.split('/');
            var newName = uuidv4();
            var time = Date.now();
            basename = path.basename(file.originalname)
            ext = path.extname(basename)
            cb(null, String(time).concat('_' + newName + ext));
        }
    });

    const uploadImage = multer({
        storage: storage,
        limits: {
            fieldSize: '1GB',
            fileSize: '100MB',
        },
        preservePath: true
    });

    app.use(express.static(__dirname + '/public/src')); 				// set the static files location /public/img will be /img for users
    app.use(morgan('dev')); 										// log every request to the console
    app.use(bodyParser.urlencoded(
        {
            extended: 'true',
            limit: '100mb',
            parameterLimit: 1000000
        }
    )); 			// parse application/x-www-form-urlencoded
    // get all data/stuff of the body (POST) parameters
    // parse application/json
    app.use(bodyParser.json({limit: '50mb'})); // parse application/json
    app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
    app.use(methodOverride());

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({extended: true}));

    // override with the X-HTTP-Method-Override header in the request. simulate
    // DELETE/PUT
    app.use(methodOverride('X-HTTP-Method-Override'));


    app.use(cors())

    // ALL
    app.all('*', function (req, res, next) {
        // TODO: Restrict these!!!
        res.setHeader("Accept", "*/*");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Accept-Encoding", "gzip, deflate, sdch");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT");
        res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, accept, authorization, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
        res.setHeader("Accept-Language", "en-US,en;q=0.8,sw;q=0.6");
        res.setHeader("DNT", "1");

        res.contentType('application/json');
        next();
    });

    // Main Page

    var case_route = require('./routes/case');
    app.get('/SubscribeTrades', case_route.SubscribeTrades);

    neb.api.getAccountState(MY_ADDRESS).then(function (state) {
        console.log(state);
    }).catch(function (err) {
        console.log(err);
    });

    function submitContract(contract, nonce) {
        const Transaction = Nebulas.Transaction;
        const tx = new Transaction({
            chainID: 1,
            from: acc,
            to: CONTRACT_ADDRESS,
            value: 0,
            nonce: parseInt(nonce) + 1,
            gasPrice: 1000000,
            gasLimit: 2000000,
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

    app.post('/Contract', function (req, res, next) {
        const body = req.body;
        const contract = body.contract;
        // https://nebula
        // sio.github.io/neb.js/Transaction.html

        neb.api.getAccountState(MY_ADDRESS).then(function (state) {
            const txHash = submitContract(contract, state.nonce);
            console.log(state);
        }).catch(function (err) {
            console.log(err);
        });

        return res.status(200).json({tx: txHash, success: 1});
    });

    app.use(function (req, res, next) {
        res.status(404);
        logger.debug(req.url);
        res.json({
            error: 'Invalid URL ' + req.url
        });
    });

    // start app ===============================================
    // startup our app at http://localhost:port
    app.listen(port, function () {
        console.log('server listening on port', port);

    });

    // expose app
    exports = module.exports = app;
}
