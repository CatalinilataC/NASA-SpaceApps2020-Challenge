const env = process.env.NODE_ENV || 'development';

const express = require("express");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: 10 * 1024 * 1024 })
const fs = require('fs');
var util = require('util');
const app = express();
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const Users = require('./user.js');
const User = require("./user.js");
const del = require('del');
const spdy = require('spdy');
const cookie = require('cookie');
const path = require('path');
const cors = require('cors')
const powerCommands = require('./test_commands');

const WebSocket = require('ws');
const { resolve } = require("path");

let PORT = 8000;



function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}





// setting up spdy server
var server_options;
//console.log(env);
if (env === 'development') {
	server_options = {
		spdy: {
			protocols: ['http/1.1'],
			plain: true,
		}
	};
} else if (env === 'production') {
    PORT = 8443;
	server_options = {
		// Private key
		key: fs.readFileSync('/home/srv/cert/privkey.pem'),

		// Fullchain file or cert file (prefer the former)
		cert: fs.readFileSync('/home/srv/cert/fullchain.pem'),

		// **optional** SPDY-specific options
		/*spdy: {
			protocols: ['h2', 'spdy/3.1', 'http/1.1'],
			plain: false,

			// **optional**
			// Parse first incoming X_FORWARDED_FOR frame and put it to the
			// headers of every request.
			// NOTE: Use with care! This should not be used without some proxy that
			// will *always* send X_FORWARDED_FOR
			//'x-forwarded-for': true,
		}*/
	};
}


const server = spdy.createServer(server_options, app);

// websocket server init

const wss = new WebSocket.Server({ noServer: true });

let ready2send = false;

wss.on('connection', function connection(ws, request, client) {
	console.log(`client id ${client.sid} connected! ${User.Ulist().size} user/s online!`);
	ws.on('close', function connection(ws) {
		User.Ulist().delete(client.sid);
		//probably also delete session
		console.log(`client id ${client.sid} disconnected connected! ${User.Ulist().size} user/s online!`);
	});
});

server.on('upgrade', function upgrade(request, socket, head) {
	// This function is not defined on purpose. Implement it with your own logic.
	authenticate(request, (err, client) => {
		if (err || !client) {
			socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
			socket.destroy();
			return;
		}

		wss.handleUpgrade(request, socket, head, function done(ws) {
			client.wsocket = ws;
			wss.emit('connection', ws, request, client);
		});
	});
});

function authenticate(req, cb) {
	const cookies = cookie.parse(req.headers.cookie);
	const sid = cookies['connect.sid'].split('.')[0].split(':')[1];
	const user = Users.Ulist().get(sid);
	let err = undefined;
	if (!user) {
		err = true;
	}
	cb(err, user);
}

// User folders and logic

let userCounter = 0;
//app.set('trust proxy', 1) // trust first proxy

const upldir = path.resolve(__dirname + '/../uploads');

if (fs.existsSync(upldir))
	del.sync([upldir]);

if (!fs.existsSync(upldir))
	fs.mkdirSync(upldir, {mode: '0777'}, (err) => {
		if (err) {
            
			return console.error(err);
		}
		console.log('Directory created successfully!');
	});

// app session init

let sess = {
	secret: '2lfigsvkuh.4sfvsfbfhnf',
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 86400000 },
	store: new MemoryStore({
		checkPeriod: 86400000 // prune expired entries every 24h
	})
};

if (app.get('env') === 'production') {
	//app.set('trust proxy', 1) // trust first proxy
	sess.cookie.secure = true // serve secure cookies
}

//express init routes and middleware

app.use(cors());

app.use(session(sess));

app.use(express.static(__dirname + "/../build"));

app.get('/', function (req, res) {
	res.sendFile(__dirname + "/../build/index.html");
});
console.log("this is dirname ", __dirname);
console.log("this is upldir", upldir);
app.get('/register', function (req, res) {
	const u = Users.Ulist().get(req.session.id);
	if (!u) {
        //console.log("ajunge la user", path.resolve(upldir + '/director' + `${userCounter}`));
		userCounter++;
		req.session.views = 1;
		Users.Ulist().set(req.session.id, { sid: req.session.id, path: path.resolve(upldir + '/director' + `${userCounter}`) });

		fs.mkdir(Users.Ulist().get(req.session.id).path, (err) => {
			if (err) {
				return console.error(err);
			}
			console.log('Directory created successfully!');
		});
		res.sendStatus(200);
	} else {
		res.sendStatus(400);
	}
});

let auxDays;
let cpUpload = upload.fields([{name: 'number', maxCount: 1}, {name: 'filez', maxCount: 4}]);
app.post('/upload', cpUpload, function (req, res) {
	const u = Users.Ulist().get(req.session.id);
    let arr = [];
	if (u) {
		u.DayNb = parseInt(req.body.number, 10); // nr de zile de prezis
		auxDays = u.DayNb;
		console.log(req.body);
		u.ready2send = false;
		req.session.views++;
        console.log("UPLOAD1");
		Promise.all(
			req.files['filez'].map(elem => {
				fs.promises.writeFile(u.path + `/${elem.originalname}`, elem.buffer);
                arr.push(u.path + `/${elem.originalname}`);
			})
		).then(x => {
            for(let j = 0; j < 4; j++)
            {
                    fs.chmodSync(arr[j], 0777);
            }
            console.log("UPLOAD2");

            res.sendStatus(200);
			// send signal to download image to frontend on socket already opened
			const execution = new Promise((resolve, reject) => {
				//rulez scriput sincron
                //sleep(24999);
				powerCommands(u.DayNb, resolve, reject, userCounter);
			})
				.then(() => {
                    console.log("UPLOAD3");
					u.ready2send = true;
					u.wsocket.send(JSON.stringify({ type: 'signal', payload: 'getResult' }));
				})

		}).catch(err => console.log(err));
		
	}
	else {
		res.sendStatus(400);
	}
});


// try sending file from static ???!!!


app.get('/finishedImages', function (req, res) {
	const User = Users.Ulist().get(req.session.id);
	if (!User) {
		res.sendStatus(400);
		return;
	}
    console.log("UPLOAD3.5");
	if (User.ready2send) {
		if(User.DayNb > 0)
		{
            console.log("UPLOAD4");
			User.DayNb--;
			res.header({
				'Content-Type': 'image/jpeg'
			});
			
			res.sendFile(path.resolve(`/home/srv/nasa_interface/FINAL_DESTINATION/image_${User.DayNb}.jpg`));
		}

	}
});

app.get('/getCSV', function (req, res) {
	const User = Users.Ulist().get(req.session.id);
	if (!User) {
		res.sendStatus(400);
		return;
	}

	if (User.ready2send) {

		if(auxDays > 0)
		{
			auxDays--;
			res.header({
				"Content-Type": "application/octet-stream",
				"Content-Disposition": 'attachment; filename="picture.png"'
			});
			
			res.sendFile(path.resolve(`/home/srv/nasa_interface/FINAL_DESTINATION/coords_${auxDays}.csv`));
		}

		

	}
});


server.listen(PORT);














	/*fs.readdir(User.path, (err, files) => {
		if (err) {
			res.sendStatus(500);
		} else {
			if (files.length >= 1) {
				res.header({
					'Content-Type' : 'image/jpeg'
				});
				res.sendFile(path.resolve(User.path + '/' + files[0]));
			}
		}
	});*/