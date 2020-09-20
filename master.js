var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var readline = require("readline");


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/web/player.html');
});

app.get('/master', (req, res) => {
	res.sendFile(__dirname + '/web/admin.html');
});

app.get('/catjamming.mp4', (req, res) => {
	res.sendFile(__dirname + '/web/catjamming.mp4');
});

io.on('connection', (socket) => {
	console.log('> ' + socket.handshake.address + ' connected');
});

io.on('connect', socket => {
	socket.on('timeSync', () => {
		socket.emit('timeSync', new Date().getTime())
	});
});



http.listen(3000, () => {
	console.log('listening on *:3000');
});

var start = 0;

function sendCommand(command, payload) {
	var now = new Date().getTime();
	var startTime = now + 200;
	var message = {
		time: startTime,
		command: command,
		payload: payload
	};
	io.emit('command', JSON.stringify(message));
	console.log("Sent command: "+command);
	return startTime;
}


function ask() {
	rl.question(":", function(ans) {
		
		switch (ans) {
			case "start":
				var now = new Date().getTime();
				var vidDur = now - start;
				
				if (vidDur > 60*30*1000) start = vidDur = 0;
				
				
				var startTime = sendCommand("sync", vidDur);
				
				if(start == 0) start = startTime;
				break;
				
			case "reset":
				start = 0;
				break;
				
		}
		

		ask();
	});
	
}

ask();





