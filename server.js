var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var stdin = process.openStdin();
var fs = require('fs');

var map = {};
var id = 0;
var index = 0;
var conns = [];

fs.readFile('map.js', function (err, data) {
	if (err) throw err;
	map = JSON.parse(data.toString());
	stdin.addListener("data", function(d) {
		if (d.toString().substring(0, d.length-1).trim() == 'save') {
			console.log('Saved!');
			fs.writeFile('map.js', JSON.stringify(map), function (err) {
				if (err) throw err;
			});
		}
		if (d.toString().substring(0, d.length-1).trim() != 'save') {
			console.log(d.toString().substring(0, d.length-1).trim());
		}
	});
});

function ifBefore(id) {
	for (a = 0; a < map.players.length; a++) {
		if (map.players[a].id == id) {
			return a;
		}
	}
	return false;
}

app.use(express.static(__dirname + '/client'));

io.on('connection', function(socket){
	id = socket.client.conn.remoteAddress;
	if (ifBefore(id) != false) {
		index = ifBefore(id);
		conns.push({id: id, x: map.players[index].x, y: map.players[index].y, z: map.players[index].z, rotx: map.players[index].rotx, roty: map.players[index].roty, rotz: map.players[index].rotz, map: map.voxels})
		socket.emit('youJoin', {id: id, x: map.players[index].x, y: map.players[index].y, z: map.players[index].z, rotx: map.players[index].rotx, roty: map.players[index].roty, rotz: map.players[index].rotz, map: map.voxels, conn: conns});
	}
	else {
		map.players.push({x: 0, y: 0, z: 0, rotx: 0, roty: 0, rotz:0, id: id});
		index = map.players.length-1;
		conns.push({id: id, x: map.players[index].x, y: map.players[index].y, z: map.players[index].z, rotx: map.players[index].rotx, roty: map.players[index].roty, rotz: map.players[index].rotz, map: map.voxels})
		socket.emit('youJoin', {id: id, x: map.players[index].x, y: map.players[index].y, z: map.players[index].z, rotx: map.players[index].rotx, roty:map.players[index].roty, rotz: map.players[index].rotz, map: map.voxels, conn: conns});
	}
	console.log("A player connected with id:" + id);
	io.emit('playerJoin', id);
	socket.on('disconnect', function(){
		console.log("A player disconnected with id:" + id);
		io.emit('playerLeave', id);
	});
	socket.on('playerLoop', function(obj){
		map.players[index] = obj;
		io.emit('playerPos', obj);
	});
	socket.on('blockcreate', function(obj){
		map.voxels.push(obj);
		socket.broadcast.emit('blockcreate', obj);
	});
	socket.on('chat', function(msg){
		io.emit('chat', msg);
	});
	socket.on('blockdestroy', function(obj){
		socket.broadcast.emit('blockdestroy', obj);
		for (e = 0; e < map.voxels.length; e++) {
			if (map.voxels[e].id == obj) {
				map.voxels.splice(e, 1);
			}
		}
	});
	socket.on('blockred', function(obj){
		socket.broadcast.emit('blockred', obj);
		for (f = 0; f < map.voxels.length; f++) {
			if (map.voxels[f].id == obj) {
				map.voxels[f].colour = 0xff0000;
			}
		}
	});
	socket.on('blockgreen', function(obj){
		socket.broadcast.emit('blockgreen', obj);
		for (g = 0; g < map.voxels.length; g++) {
			if (map.voxels[g].id == obj) {
				map.voxels[g].colour = 0x00ff00;
			}
		}
	});
	socket.on('blockblue', function(obj){
		socket.broadcast.emit('blockblue', obj);
		for (h = 0; h < map.voxels.length; h++) {
			if (map.voxels[h].id == obj) {
				map.voxels[h].colour = 0x0000ff;
			}
		}
	});
	socket.on('blockwhite', function(obj){
		socket.broadcast.emit('blockwhite', obj);
		for (i = 0; i < map.voxels.length; i++) {
			if (map.voxels[i].id == obj) {
				map.voxels[i].colour = 0xffffff;
			}
		}
	});
	socket.on('blockblack', function(obj){
		socket.broadcast.emit('blockblack', obj);
		for (j = 0; j < map.voxels.length; j++) {
			if (map.voxels[j].id == obj) {
				map.voxels[j].colour = 0x000000;
			}
		}
	});
});

http.listen(+process.argv[2], function(){
	console.log('listening on *:' + process.argv[2].toString());

});
