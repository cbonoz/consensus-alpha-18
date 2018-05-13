// modules =================================================
const express					= require('express');
const bodyParser		 	= require('body-parser');
const methodOverride 	= require('method-override');
const morgan 					= require('morgan');
const errorhandler 		= require('errorhandler');
//require('pretty-error').start();
const logger					= require('./logger');
const app						 	= express();
const getRawBody			= require('raw-body');
const typer					 	= require('media-typer');
const cluster				 	= require('cluster');
const cors						= require('cors')
const fs							= require("fs");
const rimraf					= require('rimraf');
const path						= require('path');
const multer					= require('multer');
const uuidv4					= require('uuid/v4');

// Code to run if we're in the master process
if (cluster.isMaster) {

	// Create a temporary directory for uploads.
	const tmpDir = '/tmp';
	if (!fs.existsSync(tmpDir)) {
		fs.mkdirSync(tmpDir);
	}

	fs.readdirSync(tmpDir).forEach(file => {
		file_path = tmpDir + path.sep + file
		if (fs.lstatSync(file_path).isDirectory() && file.includes("behold-api-")){
			rimraf.sync(file_path)
			logger.debug('Removed temporary directory 🗑️	:' + file_path);
		}
	})

	const upload_dir = fs.mkdtempSync(tmpDir + path.sep + 'behold-api-');
	const process_env = {
		upload_dir :upload_dir
	}
	const cpuCount = require('os').cpus().length;
	const port = process.env.PORT || 8080;

	logger.debug("✅	Starting " + cpuCount + " listener processes")

	// Create a worker for each CPU
	for (var i = 0; i < cpuCount; i += 1) {
		worker = cluster.fork(process_env);
	}

	// Listen for workers
	cluster.on('exit', function(worker) {
		// Replace the terminated workers
		logger.debug('Worker ' + worker.process.pid + ' died 💀');
		cluster.fork(process_env);
	});

	cluster.on('online', (worker) => {
		logger.debug('Started PID ⚡	: ' + worker.process.pid);
	})

	// Log to the user
	logger.info('Behold.ai API is served on port ⚓	: ' + port);

} else {

	const {upload_dir, common, request} = process.env

	const storage = multer.diskStorage({
		destination: function(req, file, cb) {
			cb(null, upload_dir);
		},
		filename: function(req, file, cb) {
			logger.debug(file)
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
		preservePath : true
	});


	// set our port
	const port = process.env.PORT || 8080;

	app.use(express.static(__dirname + '/public/src')); 				// set the static files location /public/img will be /img for users
	app.use(morgan('dev')); 										// log every request to the console
	app.use(bodyParser.urlencoded({'extended':'true'})); 			// parse application/x-www-form-urlencoded
	// get all data/stuff of the body (POST) parameters
	// parse application/json
	app.use(bodyParser.json()); 									// parse application/json
	app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
	app.use(methodOverride());

	// parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({ extended: true }));

	// override with the X-HTTP-Method-Override header in the request. simulate
	// DELETE/PUT
	app.use(methodOverride('X-HTTP-Method-Override'));


	app.use(cors())

	// ALL
	app.all('*', function(req, res, next) {
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
	app.get('/dicom', function(req, res, next) {
		console.log("req")
		console.log("req")
		console.log("req")
	});

	var image_route = require('./routes/image');
	app.post('/image/classify/chestxray14', uploadImage.array("file"), image_route.classify);

	var case_route = require('./routes/case');
	app.get('/case/list/:auth_id', case_route.list);

	var case_route = require('./routes/case');
	app.get('/case/detail/:auth_id/:case_id', case_route.detail);

	app.use(function(req, res, next){
		res.status(404);
		logger.debug(req.url);
		res.json({
			error: 'Invalid URL ' + req.url
		});
	});



	// start app ===============================================
	// startup our app at http://localhost:port
	app.listen(port);


	// expose app
	exports = module.exports = app;
}
