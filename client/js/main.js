var socket = io();
var myId = 0;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.rotation.order = "YXZ";
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var canvas = document.querySelector('canvas');

var lastLoop = new Date;
var fps;
var thisLoop;
var sensitivity = 0.005;

var mode = 'create';
var bulletModes = [];
var bullets = [];
var bullarrindexnum = 0;
var players = [];
var playerMeshes = [];
var voxels = [];
var voxelMeshes = [];
socket.on('youJoin', function(obj){
	camera.position.set(obj.x, obj.y, obj.z);
	camera.rotation.set(obj.rotx, obj.roty, obj.rotz);
	console.log("You have id:" + obj.id);
	myId = obj.id;
	for (b = 0; b < obj.conn.length; b++) {
		players.push({
			id: obj.conn[b].id,
		});
		playerMeshes.push(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial( {color: 0xffffff} )));
		scene.add(playerMeshes[playerMeshes.length-1]);
		playerMeshes[playerMeshes.length-1].position.set(obj.conn[b].x, obj.conn[b].y, obj.conn[b].z);
		playerMeshes[playerMeshes.length-1].rotation.set(obj.conn[b].rotx, obj.conn[b].roty, obj.conn[b].rotz);
	}
	voxels = obj.map;
	for (d = 0; d < voxels.length; d++) {
		voxelMeshes.push(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial( {color: voxels[d].colour} )));
		voxelMeshes[voxelMeshes.length-1].position.set(voxels[d].x, voxels[d].y, voxels[d].z);
		voxelMeshes[voxelMeshes.length-1].rotation.set(voxels[d].rotx, voxels[d].roty, voxels[d].rotz);
		scene.add(voxelMeshes[voxelMeshes.length-1]);
	}
});
socket.on('playerJoin', function(id){
	if (id != myId) {
		console.log("A player connected with id:" + id);
		players.push({
			id: id,
		});
		playerMeshes.push(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial( {color: 0xffffff} )));
		scene.add(playerMeshes[playerMeshes.length-1]);
	}
});
socket.on('playerPos', function(obj){
	for (i = 0; i<players.length; i++) {
		if (players[i].id == obj.id) {
			playerMeshes[i].position.x = obj.x;
			playerMeshes[i].position.y = obj.y;
			playerMeshes[i].position.z = obj.z;
			playerMeshes[i].rotation.x = obj.rotx;
			playerMeshes[i].rotation.y = obj.roty;
			playerMeshes[i].rotation.z = obj.rotz;
		}
	}
});
socket.on('playerLeave', function (id){
	console.log("A player disconnected with id:" + id);
	for (j = 0; j<players.length; j++) {
		if (players[j].id == id) {
			scene.remove(playerMeshes[j]);
			players.splice(j, 1);
			playerMeshes.splice(j, 1);
		}
	}
});
socket.on('blockcreate', function(obj){
	voxels.push(obj);
	voxelMeshes.push(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial( {color: obj.colour} )));
	voxelMeshes[voxelMeshes.length-1].position.set(obj.x, obj.y, obj.z);
	voxelMeshes[voxelMeshes.length-1].rotation.set(obj.rotx, obj.roty, obj.rotz);
	scene.add(voxelMeshes[voxelMeshes.length-1]);
});
socket.on('blockdestroy', function(obj){
	for (e = 0; e < voxels.length; e++) {
		if (voxels[e].id == obj) {
			scene.remove(voxelMeshes[e]);
			voxels.splice(e, 1);
			voxelMeshes.splice(e, 1);
		}
	}
});
socket.on('blockred', function(obj){
	for (f = 0; f < voxels.length; f++) {
		if (voxels[f].id == obj) {
			voxelMeshes[f].material = new THREE.MeshBasicMaterial({color: 0xff0000});
		}
	}
});
socket.on('blockgreen', function(obj){
	for (g = 0; g < voxels.length; g++) {
		if (voxels[g].id == obj) {
			voxelMeshes[g].material = new THREE.MeshBasicMaterial({color: 0x00ff00});
		}
	}
});
socket.on('blockblue', function(obj){
	for (h = 0; h < voxels.length; h++) {
		if (voxels[h].id == obj) {
			voxelMeshes[h].material = new THREE.MeshBasicMaterial({color: 0x0000ff});
		}
	}
});
socket.on('blockwhite', function(obj){
	for (i = 0; i < voxels.length; i++) {
		if (voxels[i].id == obj) {
			voxelMeshes[i].material = new THREE.MeshBasicMaterial({color: 0xffffff});
		}
	}
});
socket.on('blockblack', function(obj){
	for (j = 0; j < voxels.length; j++) {
		if (voxels[j].id == obj) {
			voxelMeshes[j].material = new THREE.MeshBasicMaterial({color: 0x000000});
		}
	}
});

function testCol(xcol, ycol, zcol) {
	for (voxcount = 0; voxcount < voxelMeshes.length; voxcount++) {
		if (zcol > (voxelMeshes[voxcount].position.z - 0.5) && zcol < (voxelMeshes[voxcount].position.z + 0.5)) {
			if (xcol > (voxelMeshes[voxcount].position.x - 0.5) && xcol < (voxelMeshes[voxcount].position.x + 0.5)) {
				if (ycol > (voxelMeshes[voxcount].position.y - 0.5) && ycol < (voxelMeshes[voxcount].position.y + 0.5)) {
					return(false);
				}
			}
		}
	}
	return(true);
}

function findCol(xcol, ycol, zcol) {
	for (voxcount = 0; voxcount < voxelMeshes.length; voxcount++) {
		if (zcol > (voxelMeshes[voxcount].position.z - 0.5) && zcol < (voxelMeshes[voxcount].position.z + 0.5)) {
			if (xcol > (voxelMeshes[voxcount].position.x - 0.5) && xcol < (voxelMeshes[voxcount].position.x + 0.5)) {
				if (ycol > (voxelMeshes[voxcount].position.y - 0.5) && ycol < (voxelMeshes[voxcount].position.y + 0.5)) {
					return(voxcount);
				}
			}
		}
	}
}

function clickInteract() {
	if (mode == 'create') {
        bullets[bullarrindexnum] = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0x00CCFF}));
        scene.add(bullets[bullarrindexnum]);
        bullets[bullarrindexnum].rotation.copy(camera.rotation);
        bullets[bullarrindexnum].position.copy(camera.position);
        bulletModes[bullarrindexnum] = 'create';
        bullarrindexnum++;
    }
    if (mode == 'destroy') {
        bullets[bullarrindexnum] = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0xFFCC00}));
        scene.add(bullets[bullarrindexnum]);
        bullets[bullarrindexnum].rotation.copy(camera.rotation);
        bullets[bullarrindexnum].position.copy(camera.position);
        bulletModes[bullarrindexnum] = 'destroy';
        bullarrindexnum++;
    }
	if (mode == 'red') {
        bullets[bullarrindexnum] = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0xFF0000}));
        scene.add(bullets[bullarrindexnum]);
        bullets[bullarrindexnum].rotation.copy(camera.rotation);
        bullets[bullarrindexnum].position.copy(camera.position);
        bulletModes[bullarrindexnum] = 'red';
        bullarrindexnum++;
    }
	if (mode == 'green') {
        bullets[bullarrindexnum] = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0x00FF00}));
        scene.add(bullets[bullarrindexnum]);
        bullets[bullarrindexnum].rotation.copy(camera.rotation);
        bullets[bullarrindexnum].position.copy(camera.position);
        bulletModes[bullarrindexnum] = 'green';
        bullarrindexnum++;
    }
	if (mode == 'blue') {
        bullets[bullarrindexnum] = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0x0000FF}));
        scene.add(bullets[bullarrindexnum]);
        bullets[bullarrindexnum].rotation.copy(camera.rotation);
        bullets[bullarrindexnum].position.copy(camera.position);
        bulletModes[bullarrindexnum] = 'blue';
        bullarrindexnum++;
    }
	if (mode == 'white') {
        bullets[bullarrindexnum] = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0xFFFFFF}));
        scene.add(bullets[bullarrindexnum]);
        bullets[bullarrindexnum].rotation.copy(camera.rotation);
        bullets[bullarrindexnum].position.copy(camera.position);
        bulletModes[bullarrindexnum] = 'white';
        bullarrindexnum++;
    }
	if (mode == 'black') {
        bullets[bullarrindexnum] = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0x000000}));
        scene.add(bullets[bullarrindexnum]);
        bullets[bullarrindexnum].rotation.copy(camera.rotation);
        bullets[bullarrindexnum].position.copy(camera.position);
        bulletModes[bullarrindexnum] = 'black';
        bullarrindexnum++;
    }
}

var Key = {
_pressed: {},
	ONE: 49,
	TWO: 50,
	THREE: 51,
	FOUR: 52,
	FIVE: 53,
	SIX: 54,
	SEVEN: 55,
   	A: 65,
	W: 87,
    D: 68,
    S: 83,
    SPACE: 32,
    SHIFT: 16,
    
    isDown: function(keyCode) {
return this._pressed[keyCode];
    },
  
    onKeydown: function(keyevent) {
      this._pressed[keyevent.keyCode] = true;
    },
  
    onKeyup: function(keyevent) {
      delete this._pressed[keyevent.keyCode];
    }
};

var onMouseMove = function ( event ) {

	var mouseDX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	var mouseDY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

	camera.rotation.y -= mouseDX * sensitivity;
	camera.rotation.x -= mouseDY * sensitivity;
	
	if (camera.rotation.x < (-Math.PI/2)) {
		camera.rotation.x = (-Math.PI/2);
	}
	if (camera.rotation.x > (Math.PI/2)) {
		camera.rotation.x = (Math.PI/2);
	}

};

canvas.requestPointerLock = canvas.requestPointerLock ||
        canvas.mozRequestPointerLock ||
        canvas.webkitRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;
window.onclick = function() {
  		canvas.requestPointerLock();
}
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);
function lockChangeAlert() {
  if(document.pointerLockElement === canvas ||
  document.mozPointerLockElement === canvas ||
  document.webkitPointerLockElement === canvas) {
    console.log('The pointer lock status is now locked');
    canvas.addEventListener('mousemove', onMouseMove, false );
	canvas.addEventListener( 'click', clickInteract, false );
    window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
	window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);
  } else {
    console.log('The pointer lock status is now unlocked');  
    canvas.removeEventListener( 'mousemove', onMouseMove, false );
	canvas.removeEventListener( 'click', clickInteract, false );
    window.removeEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
	window.removeEventListener('keydown', function(event) { Key.onKeydown(event); }, false);
  }
}

var render = function () {
	thisLoop = new Date;
	fps = 1000 / (thisLoop - lastLoop);
	lastLoop = thisLoop;
	requestAnimationFrame(render);
	for (counter = 0; counter < bullets.length; counter++) {
		if (testCol(bullets[counter].position.x - (5 * Math.sin(bullets[counter].rotation.y))/fps, bullets[counter].position.y + (5 * Math.tan(bullets[counter].rotation.x))/fps, bullets[counter].position.z - (5 * Math.cos(bullets[counter].rotation.y))/fps)) {
			bullets[counter].position.x -= (5 * Math.sin(bullets[counter].rotation.y))/fps;
			bullets[counter].position.y += (5 * Math.tan(bullets[counter].rotation.x))/fps;
			bullets[counter].position.z -= (5 * Math.cos(bullets[counter].rotation.y))/fps;
		}
		else {
			if (bulletModes[counter] == "destroy") {
				voxcolbulltempnum = findCol(bullets[counter].position.x - (5 * Math.sin(bullets[counter].rotation.y))/fps, bullets[counter].position.y + (5 * Math.tan(bullets[counter].rotation.x))/fps, bullets[counter].position.z - (5 * Math.cos(bullets[counter].rotation.y))/fps);
				scene.remove(voxelMeshes[voxcolbulltempnum]);
				voxelMeshes.splice(voxcolbulltempnum, 1);
				socket.emit('blockdestroy', voxels[voxcolbulltempnum].id);
				voxels.splice(voxcolbulltempnum, 1);
				scene.remove(bullets[counter]);
				bullets.splice(counter, 1);
				bulletModes.splice(counter, 1);
				bullarrindexnum--;
			}
			if (bulletModes[counter] == "create") {
				voxelMeshes.push(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial( {color: 0xffffff} )));
				voxels.push({x: Math.round(bullets[counter].position.x), y: Math.round(bullets[counter].position.y), z: Math.round(bullets[counter].position.z), rotx: 0, roty: 0, rotz: 0, id: voxels.length, colour: 0xffffff});
				scene.add(voxelMeshes[voxels.length-1]);
				voxelMeshes[voxels.length-1].position.set(Math.round(bullets[counter].position.x), Math.round(bullets[counter].position.y), Math.round(bullets[counter].position.z));
				scene.remove(bullets[counter]);
				bullets.splice(counter, 1);
				bulletModes.splice(counter, 1);
				bullarrindexnum--;
				socket.emit('blockcreate', voxels[voxels.length-1]);
			}
			if (bulletModes[counter] == "red") {
				voxcolbulltempnum = findCol(bullets[counter].position.x - (5 * Math.sin(bullets[counter].rotation.y))/fps, bullets[counter].position.y + (5 * Math.tan(bullets[counter].rotation.x))/fps, bullets[counter].position.z - (5 * Math.cos(bullets[counter].rotation.y))/fps);
				socket.emit('blockred', voxels[voxcolbulltempnum].id);
				voxelMeshes[voxcolbulltempnum].material = new THREE.MeshBasicMaterial({color: 0xff0000});
				scene.remove(bullets[counter]);
				bullets.splice(counter, 1);
				bulletModes.splice(counter, 1);
				bullarrindexnum--;
			}
			if (bulletModes[counter] == "green") {
				voxcolbulltempnum = findCol(bullets[counter].position.x - (5 * Math.sin(bullets[counter].rotation.y))/fps, bullets[counter].position.y + (5 * Math.tan(bullets[counter].rotation.x))/fps, bullets[counter].position.z - (5 * Math.cos(bullets[counter].rotation.y))/fps);
				socket.emit('blockgreen', voxels[voxcolbulltempnum].id);
				voxelMeshes[voxcolbulltempnum].material = new THREE.MeshBasicMaterial({color: 0x00ff00});
				scene.remove(bullets[counter]);
				bullets.splice(counter, 1);
				bulletModes.splice(counter, 1);
				bullarrindexnum--;
			}
			if (bulletModes[counter] == "blue") {
				voxcolbulltempnum = findCol(bullets[counter].position.x - (5 * Math.sin(bullets[counter].rotation.y))/fps, bullets[counter].position.y + (5 * Math.tan(bullets[counter].rotation.x))/fps, bullets[counter].position.z - (5 * Math.cos(bullets[counter].rotation.y))/fps);
				socket.emit('blockblue', voxels[voxcolbulltempnum].id);
				voxelMeshes[voxcolbulltempnum].material = new THREE.MeshBasicMaterial({color: 0x0000ff});
				scene.remove(bullets[counter]);
				bullets.splice(counter, 1);
				bulletModes.splice(counter, 1);
				bullarrindexnum--;
			}
			if (bulletModes[counter] == "white") {
				voxcolbulltempnum = findCol(bullets[counter].position.x - (5 * Math.sin(bullets[counter].rotation.y))/fps, bullets[counter].position.y + (5 * Math.tan(bullets[counter].rotation.x))/fps, bullets[counter].position.z - (5 * Math.cos(bullets[counter].rotation.y))/fps);
				socket.emit('blockwhite', voxels[voxcolbulltempnum].id);
				voxelMeshes[voxcolbulltempnum].material = new THREE.MeshBasicMaterial({color: 0xffffff});
				scene.remove(bullets[counter]);
				bullets.splice(counter, 1);
				bulletModes.splice(counter, 1);
				bullarrindexnum--;
			}
			if (bulletModes[counter] == "black") {
				voxcolbulltempnum = findCol(bullets[counter].position.x - (5 * Math.sin(bullets[counter].rotation.y))/fps, bullets[counter].position.y + (5 * Math.tan(bullets[counter].rotation.x))/fps, bullets[counter].position.z - (5 * Math.cos(bullets[counter].rotation.y))/fps);
				socket.emit('blockblack', voxels[voxcolbulltempnum].id);
				voxelMeshes[voxcolbulltempnum].material = new THREE.MeshBasicMaterial({color: 0x000000});
				scene.remove(bullets[counter]);
				bullets.splice(counter, 1);
				bulletModes.splice(counter, 1);
				bullarrindexnum--;
			}
		}
	}
	if (Key.isDown(Key.ONE)) {
		mode = 'create';
	}
	if (Key.isDown(Key.TWO)) {
		mode = 'destroy';
	}
	if (Key.isDown(Key.THREE)) {
		mode = 'red';
	}
	if (Key.isDown(Key.FOUR)) {
		mode = 'green';
	}
	if (Key.isDown(Key.FIVE)) {
		mode = 'blue';
	}
	if (Key.isDown(Key.SIX)) {
		mode = 'white';
	}
	if (Key.isDown(Key.SEVEN)) {
		mode = 'black';
	}
	if (Key.isDown(Key.W)) {
		if (testCol(camera.position.x - 2 * (Math.sin(camera.rotation.y) / fps), camera.position.y, camera.position.z - 2 * (Math.cos(camera.rotation.y) / fps)) && testCol(camera.position.x - 2 * (Math.sin(camera.rotation.y) / fps), camera.position.y, camera.position.z - 2 * (Math.cos(camera.rotation.y) / fps))) {
			camera.position.x -= 2 * Math.sin(camera.rotation.y) / fps;
			camera.position.z -= 2 * Math.cos(camera.rotation.y) / fps;
		}
	}
	if (Key.isDown(Key.A)) {
		if (testCol(camera.position.x - 2 * (Math.sin(camera.rotation.y + Math.PI/2) / fps), camera.position.y, camera.position.z - 2 * (Math.cos(camera.rotation.y + Math.PI/2) / fps)) && testCol(camera.position.x - 2 * (Math.sin(camera.rotation.y + Math.PI/2) / fps), camera.position.y, camera.position.z - 2 * (Math.cos(camera.rotation.y + Math.PI/2) / fps))) {
			camera.position.x -= 2 * Math.sin(camera.rotation.y + Math.PI/2) / fps;
			camera.position.z -= 2 * Math.cos(camera.rotation.y + Math.PI/2) / fps;
		}
	}
	if (Key.isDown(Key.S)) {
		if (testCol(camera.position.x + 2 * (Math.sin(camera.rotation.y) / fps), camera.position.y, camera.position.z + 2 * (Math.cos(camera.rotation.y) / fps)) && testCol(camera.position.x + 2 * (Math.sin(camera.rotation.y) / fps), camera.position.y, camera.position.z + 2 * (Math.cos(camera.rotation.y) / fps))) {
			camera.position.x += 2 * Math.sin(camera.rotation.y) / fps;
			camera.position.z += 2 * Math.cos(camera.rotation.y) / fps;
		}
	}
	if (Key.isDown(Key.D)) {
		if (testCol(camera.position.x - 2 * (Math.sin(camera.rotation.y - Math.PI/2) / fps), camera.position.y-1.75, camera.position.z - 2 * (Math.cos(camera.rotation.y - Math.PI/2) / fps)) && testCol(camera.position.x - 2 * (Math.sin(camera.rotation.y - Math.PI/2) / fps), camera.position.y, camera.position.z - 2 * (Math.cos(camera.rotation.y - Math.PI/2) / fps))) {
			camera.position.x -= 2 * Math.sin(camera.rotation.y - Math.PI/2) / fps;
			camera.position.z -= 2 * Math.cos(camera.rotation.y - Math.PI/2) / fps;
		}
	}
	if (Key.isDown(Key.SPACE)) {
		if (testCol(camera.position.x, (camera.position.y + 2 / fps), camera.position.z)) {
			camera.position.y += 2 / fps;
		}
	}
	if (Key.isDown(Key.SHIFT)) {
		if (testCol(camera.position.x, (camera.position.y - 2 / fps), camera.position.z)) {
			camera.position.y -= 2 / fps;
		}
	}
	socket.emit('playerLoop', {x:camera.position.x, y:camera.position.y, z:camera.position.z, rotx:camera.rotation.x, roty:camera.rotation.y, rotz:camera.rotation.z, id:myId});
	for (var c = 0; c < players.length; c++) {
		if (players[c].id == myId) {
			playerMeshes[c].position.x = camera.position.x;
			playerMeshes[c].position.y = camera.position.y;
			playerMeshes[c].position.z = camera.position.z;
			playerMeshes[c].rotation.x = camera.rotation.x;
			playerMeshes[c].rotation.y = camera.rotation.y;
			playerMeshes[c].rotation.z = camera.rotation.z;
		}
	}
	renderer.render(scene, camera);
};
render();