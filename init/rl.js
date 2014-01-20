// Font size
var FONT = 32;

// The ascii display 
var screen;

// Map dimensions
var map;
var ROWS = 10;
var COLS = 15;

// Actors per level (including player)
var ACTORS = 10;

// Initialize phaser, call create() once done
var game = new Phaser.Game(COLS * FONT * 0.6, ROWS * FONT, Phaser.AUTO, null, {
	create: create
});

function create() {

	// Initialize keyboard commands
	game.input.keyboard.addCallbacks(null, null, onKeyUp);

	// Initialize map
	initMap();

	// Initialize screen
	screen = [];
	for (var y = 0; y < ROWS; y++) {
		var newRow = [];
		screen.push(newRow);
		for (var x = 0; x < COLS; x++)
			newRow.push(initCell('', x, y));
	}
	drawMap();

	initActors();
	drawActors();
}

function initCell(chr, x, y) {
	// Add a single cell in a given position to the ascii display
	var style = { font: FONT + "px monospace", fill:"#fff"};
	return game.add.text(FONT*0.6*x, FONT*y, chr, style);
}

function onKeyUp(event) {
	switch (event.keyCode) {
		case Keyboard.LEFT:

		case Keyboard.RIGHT:

		case Keyboard.UP:

		case Keyboard.DOWN:
	}
}

function initMap() {
	// Create a new random map
	map = [];
	for (var y = 0; y < ROWS; y++) {
	    var newRow = [];
	    for (var x = 0; x < COLS; x++) {
	        if (Math.random() > 0.8)
	            newRow.push('#');
	        else
	            newRow.push('.');
	    }
	    map.push(newRow);
	}
}

function drawMap() {
	for (var y = 0; y < ROWS; y++)
		for (var x = 0; x < COLS; x++)
			screen[y][x].content = map[y][x];
}

// A list of all actors; 0 is the player
var player;
var actorList;
var livingEnemies;

// Points to each actor in its position for quick searching
var actorMap;

function randomInt(max) {
	return Math.floor(Math.random() * max);
}

function initActors() {

	// Create Actors at random locations
	actorList = [];
	actorMap = {};
	for (var e = 0; e < ACTORS; e++) {
		// Creaete a new actor
		var actor = { x:0, y:0, hp:e == 0?3:1 };
		do {
			// Pick a random position that is both a floor and not occupied
			actor.y = randomInt(ROWS);
			actor.x = randomInt(COLS);
		} while (map[actor.y][actor.x] == '#' || actorMap[actor.y + "_" + actor.x] != null);

		// Add references to the actor to the actors list & map
		actorMap[actor.y + "_" + actor.x] = actor;
		actorList.push(actor);
	}

	// The player is the first actor in the list
	player = actorList[0];
	livingEnemies = ACTORS-1;
}

function drawActors() {
	for (var a in actorList) {
		if (actorList[a].hp > 0)
			screen[actorList[a].y][actorList[a].x].content = a == 0?'' + player.hp:'e';
	}
}

function canGo(actor, dir) {
	return actor.x + dir.x >= 0 && 
		actor.x + dir.x <= COLS-1 &&
		actor.y + dir.y >= 0 &&
		actor.y + dir.y <= ROWS-1 &&
		map[actor.y + dir.y][actor.x + dir.x] == '.';
}