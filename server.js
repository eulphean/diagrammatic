let express = require('express');
let osc = require('node-osc');
let socket = require('socket.io');
let cors = require('cors');

let app = express();
app.use(express.static('public'));
app.use(cors());
let server = require('http').createServer(app);

let oscServer, oscClient;
let isConnected = false;

io = socket(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
		credentials: true
	}
}); 

// needs to be rewritten to play nice with express app
io.sockets.on('connection', newConnection);

function newConnection (socket) {
	console.log('connection');
	console.log('socket');

	socket.on("config", function (obj) {
		isConnected = true;
		oscServer = new osc.Server(obj.server.port, obj.server.host);
		oscClient = new osc.Client(obj.client.host, obj.client.port);
		oscClient.send('/status', socket.sessionId + ' connected');
		oscServer.on('message', function(msg, rinfo) {
			socket.emit("message", msg);
		});
		socket.emit("connected", 1);
	});

	socket.on("message", function (obj) {
		oscClient.send.apply(oscClient, obj);
	});

	socket.on('disconnect', function(){
		if (isConnected) {
			oscServer.close();
			oscClient.close();
			// oscServer.kill();
			// oscClient.kill();
		}
	});
};

console.log("my socket server is running");

// ------------------ Express webserver ------------------------ //
server.listen(process.env.PORT || 3000, function() {
    console.log('Server successfully started'); 
});