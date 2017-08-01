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

var Game = {};

Game.run = function (context) {
	this.ctx = context;
	this._previousElapsesd = 0;

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
	this.tileAtlas = Loader.getImage('tiles');
};

Game.update = function (delta) {
};

Game.render = function () {
	for (var c = 0; c < map.cols; c++) {
		for (var r = 0; r < map.rows; r++) {
			var tile = map.getTile(c, r);
			if (tile !== 0) {
				this.ctx.drawImage(
					this.tileAtlas,
					((tile - 1) % 4) * map.tsize,
					Math.floor((tile - 1) / 4) * map.tsize,
					map.tsize,
					map.tsize,
					c * map.tsize,
					r * map.tsize,
					map.tsize,
					map.tsize
				);
			}
		}
	}
};

window.onload = function () {
	var context = document.getElementById('canvas').getContext('2d');
	Game.run(context);
};

var map = {
	cols: 8,
	rows: 8,
	tsize: 256,
	tiles: [
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0
	],
	getTile: function(col, row) {
		var index = row * map.cols + col;
		if (this.tiles[index] === 0) {
			this.tiles[index] = Math.floor(Math.random() * 12 + 1);
		};
		return this.tiles[index]
	}
};
