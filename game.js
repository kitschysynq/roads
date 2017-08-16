
var Loader = {
	images: {}
};

Loader.loadImage = function (key, src) {
	var img = new Image();
	var d = new Promise(function(resolve, reject) {
		img.onload = function () {
			this.images[key] = img;
			resolve(img);
		}.bind(this);

		img.onerror = function () {
			reject('Could not load image: ' + src);
		};
	}.bind(this));

	img.src = src;
	return d;
};

Loader.getImage = function (key) {
	return (key in this.images) ? this.images[key] : null;
};

var Keyboard = {};

Keyboard.LEFT = 37;
Keyboard.RIGHT = 39;
Keyboard.UP = 38;
Keyboard.DOWN = 40;

Keyboard._keys = {};

Keyboard.listenForEvents = function (keys) {
	window.addEventListener('keydown', this._onKeyDown.bind(this));
	window.addEventListener('keyup', this._onKeyUp.bind(this));
	keys.forEach(function (key) {
		this._keys[key] = false;
	}.bind(this));
};

Keyboard._onKeyDown = function (event) {
	var keyCode = event.keyCode;
	if (keyCode in this._keys) {
		event.preventDefault();
		this._keys[keyCode] = true;
	}
};

Keyboard._onKeyUp = function (event) {
	var keyCode = event.keyCode;
	if (keyCode in this._keys) {
		event.preventDefault();
		this._keys[keyCode] = false;
	}
};

Keyboard.isDown = function (keyCode) {
	if (!keyCode in this._keys) {
		throw new Error('Keycode ' + keyCode + ' is not being listened to');
	}
	return this._keys[keyCode];
};

function Camera (map, width, height) {
	this.map = map;
	this.x = 0;
	this.y = 0;
	this.width = width;
	this.height = height;
	this.maxX = map.cols * map.tsize - width;
	this.maxY = map.rows * map.tsize - height;
};

Camera.SPEED = 256;

Camera.prototype.move = function (delta, dirx, diry) {
	this.x += dirx * Camera.SPEED * delta;
	this.y += diry * Camera.SPEED * delta;
	this.x = Math.max(0, Math.min(this.x, this.maxX));
	this.y = Math.max(0, Math.min(this.y, this.maxY));
};

var Game = {};

Game.run = function (context) {
	this.ctx = context;
	this._previousElapsed = 0;

	var p = this.load();
	Promise.all(p).then(function (loaded) {
		this.init();
		window.requestAnimationFrame(this.tick);
	}.bind(this));
};

Game.tick = function (elapsed) {
	window.requestAnimationFrame(this.tick);
	this.ctx.clearRect(0, 0, 640, 480);
	var delta = (elapsed - this._previousElapsed) / 1000.0;
	delta = Math.min(delta, 0.25);
	this._previousElapsed = elapsed;
	this.update(delta);
	this.render();
}.bind(Game);

Game.load = function () {
	return [
		Loader.loadImage('tiles', 'images/atlas.jpg')
	];
};

Game.init = function () {
	Keyboard.listenForEvents(
		[Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN]);
	this.tileAtlas = Loader.getImage('tiles');
	map2.init(8, 8);
	this.camera = new Camera(map2, 640, 480);
};

Game.update = function (delta) {
	var dirx = 0;
	var diry = 0;
	if(Keyboard.isDown(Keyboard.LEFT)) { dirx = -1; };
	if(Keyboard.isDown(Keyboard.RIGHT)) { dirx = 1; };
	if(Keyboard.isDown(Keyboard.UP)) { diry = -1; };
	if(Keyboard.isDown(Keyboard.DOWN)) { diry = 1; };
	this.camera.move(delta, dirx, diry);
};

Game.render = function () {
	var startCol = Math.floor(this.camera.x / this.camera.map.tsize);
	var endCol = startCol + (this.camera.width / this.camera.map.tsize);
	var startRow = Math.floor(this.camera.y / this.camera.map.tsize);
	var endRow = startRow + (this.camera.height / this.camera.map.tsize);
	var offsetX = -this.camera.x + startCol * this.camera.map.tsize;
	var offsetY = -this.camera.y + startRow * this.camera.map.tsize;

	for (var c = startCol; c <= endCol + 1; c++) {
		for (var r = startRow; r <= endRow + 1; r++) {
			var tile = this.camera.map.getTile(c, r);
			var x = (c - startCol) * this.camera.map.tsize + offsetX;
			var y = (r - startRow) * this.camera.map.tsize + offsetY;
			if (tile !== 0) {
				this.ctx.drawImage(
					this.tileAtlas,
					((tile - 1) % 4) * this.camera.map.tsize,
					Math.floor((tile - 1) / 4) * this.camera.map.tsize,
					this.camera.map.tsize,
					this.camera.map.tsize,
					Math.round(x),
					Math.round(y),
					this.camera.map.tsize,
					this.camera.map.tsize
				);
			}
		}
	}
};

window.onload = function () {
	var context = document.getElementById('canvas').getContext('2d');
	Game.run(context);
};

var map2 = {
	cols: 8,
	rows: 8,
	tsize: 256,
	tiles: {},
	init: function (c, r) {
		this.cols = c;
		this.rows = r;
		for(var col = 0; col < c; col++) {
			for(var row = 0; row < r; row++) {
				this.tiles[[col, row]] = (
						(col != 0) * 8 +
						(col != Math.floor(c - 1)) * 4 +
						(row != 0) * 2 +
						(row != Math.floor(r - 1)) * 1
				);
			}
		}
	},
	getTile: function (c, r) {
		return this.TILES.get(this.tiles[[c, r]]);
	},
	TILES: new Map([
		[0,  6],
		[3,  4],
		[5,  7],
		[6,  2],
		[7,  9],
		[9,  8],
		[10,  5],
		[11, 12],
		[12,  1],
		[13, 11],
		[14, 10],
		[15,  3]
	])
}
