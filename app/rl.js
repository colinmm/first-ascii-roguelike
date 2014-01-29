// Font size
var FONT = 16;

// The ascii display 
var screen;

// Map dimensions
var map;
var ROWS = 20;
var COLS = 30;

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
	for(var y = 0; y < ROWS; y++) {
		var newRow = [];
		screen.push(newRow);
		for(var x = 0; x < COLS; x++)
			newRow.push(initCell('', x, y));
	}
	drawMap();

	// Initialize actors
	initActors();
	drawActors();

	// console.log(actorList);
}

function initCell(chr, x, y) {

	// Add a single cell in a given position to the ascii display
	var style = { font: FONT + "px monospace", fill:"#fff"};
	return game.add.text(FONT*0.6*x, FONT*y, chr, style);
}

function onKeyUp(event) {

	// Draw map to overwrite previous actor's positions
	drawMap();

	// Act on player input
	var acted = false;
	switch (event.keyCode) {
		case Phaser.Keyboard.LEFT:
			acted = moveTo(player, {x:-1, y:0});
			break;
		case Phaser.Keyboard.RIGHT:
			acted = moveTo(player,{x:1, y:0});
			break;
		case Phaser.Keyboard.UP:
			acted = moveTo(player, {x:0, y:-1});
			break;
		case Phaser.Keyboard.DOWN:
			acted = moveTo(player, {x:0, y:1});
			break;
		case Phaser.Keyboard.SPACEBAR:
			acted = true;
			break;
	}

	// Movement turns
	if(acted)
		for(var enemy in actorList) {
			
			// Skip the player
			if(enemy == 0)
				continue;

			var e = actorList[enemy];
			if(e != null)
				aiAct(e);
		}

	// Draw actors in new positions
	drawActors();
}

function initMap() {
	
	// Create a new random map
	map = [];
	for(var y = 0; y < ROWS; y++) {
	    var newRow = [];
	    for(var x = 0; x < COLS; x++) {
	        if(Math.random() > 0.8)
	            newRow.push('#');
	        else
	            newRow.push('.');
	    }
	    map.push(newRow);
	}
}

function drawMap() {
	for(var y = 0; y < ROWS; y++)
		for(var x = 0; x < COLS; x++)
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
	for(var e = 0; e < ACTORS; e++) {

		// Create a new actor with a position and hp
		var actor = { x:0, 
			y:0, 
			hp:e == 0?5:1 };
		do {
			// Pick a random position that is both a floor and not occupied
			actor.y = randomInt(ROWS);
			actor.x = randomInt(COLS);
		} while(map[actor.y][actor.x] == '#' || actorMap[actor.y + "_" + actor.x] != null);

		// Add references to the actor to the actors list & map
		actorMap[actor.y + "_" + actor.x] = actor;
		actorList.push(actor);
	}

	// The player is the first actor in the list
	player = actorList[0];
	livingEnemies = ACTORS-1;
}

function drawActors() {
	for(var a in actorList) {
		if (actorList[a] != null && actorList[a].hp > 0)
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

function moveTo(actor, dir) {
	
	// Check if an actor can move in a given direction
	if(!canGo(actor, dir))
		return false;

	// Move an actor to new location
	var newKey = (actor.y + dir.y) + '_' + (actor.x + dir.x);

	// If the destination tile has an actor in it
	if(actorMap[newKey] != null) {

		// Decrement hp of the actor at the destination
		var victim = actorMap[newKey];
		victim.hp--;
		document.getElementById('text_log').innerHTML = 'hit!';

		// If actor is dead remove its reference
		if(victim.hp == 0) {
			actorMap[newKey] = null;
			actorList[actorList.indexOf(victim)] = null;

			if(victim != player) {
				livingEnemies--;

				if(livingEnemies == 0) {

					// Victory message
					var victory = game.add.text(game.world.centerX, game.world.centerY, 'Victory!\nCtrl+r to restart', { fill : '#2e2', align: "center" });
					victory.anchor.setTo(0.5,0.5);
				}
			}
		}

	} else {
		// Remove reference to actor's old position
		actorMap[actor.y + '_' + actor.x] = null;

		// Update position
		actor.y += dir.y;
		actor.x += dir.x;

		// Add reference to the actor's new position
		actorMap[actor.y + '_' + actor.x] = actor;
	}

	return true;
}

function aiAct(actor) {
	var directions = [{ x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 }];
	var dx = player.x - actor.x;
	var dy = player.y - actor.y;

	// If player is far away, walk randomly
	if(Math.abs(dx) + Math.abs(dy) > 6)

		// Walk in random directions until successful
		while(!moveTo(actor, directions[randomInt(directions.length)])) {};

	// Otherwise walk towards player
	if(Math.abs(dx) > Math.abs(dy)) {
		if(dx < 0) {
			// Left
			moveTo(actor, directions[0]);
		} else {
			// Right
			moveTo(actor, directions[1]);
		}
	} else {
		if(dy < 0) {
			// Up
			moveTo(actor, directions[2]);
		} else {
			// Down
			moveTo(actor, directions[3]);
		}
	}

	if(player.hp < 1) {
		// Player dies, game over man
		var gameOver = game.add.text(game.world.centerX, game.world.centerY, 'Game Over\nCtrl+r to restart', { fill : '#e22', align: "center" } );
		gameOver.anchor.setTo(0.5,0.5);
	}
}
