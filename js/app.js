/* app.js
 * Implements the classes BugEnemy(derived from Enemy) and Player that are featured in the game
 * Player is the character that the user controls and BugEnemy are the enemies that move side to side
 * which kill the player on touch
 */

var NUM_ENEMIES = 6;          // num of total enemies in the game
var Y_SCALE = 83;             // this is the vertical scaling on the board: the spacing each tile takes up vertically
var X_SCALE = 101;            // this is the horizontal scaling on the board
var Y_OFFSET = 25;            // arbitrary vertical offset to align the enemies better vertically on the board
var X_OFFSET = 35;            // arbitrary horizontal offset to align the enemies better horizontally on the board

var IMAGE_WIDTH = 101;        // the width of the image of the character model and enemy model
var IMAGE_HEIGHT = 171;       // the height of the image of the character model and enemy model

var NUMROWS = 6;              // the number of rows on the board
var NUMCOLS = 5;              // the number of columns on the board

/* Superclass that BugEnemy derives from
 * In case we want to feature different kinds of enemies in future updates
 * @constructor
 * @param   init_xpos   initial x-position at initialization
 * @param   init_ypos   initial y-position at initialization
 * @param   speed_ratio the speed at which the enemy will move
 */
var Enemy = function(init_xpos, init_ypos, speed_ratio) {
    this.x = init_xpos;
    this.y = init_ypos;
    this.speed = speed_ratio;
};

/* Enemies our player must avoid
 * Has an additional sprite member variable for the image and a row parameter to tell which row Bug is on (used to simplify collision logic)
 * @constructor
 * @param   init_xpos   initial x-position at initialization
 * @param   init_ypos   initial y-position at initialization
 * @param   speed_ratio the speed at which the enemy will move
 * @param   rows        the row that the Bug will spawn on
 */
var BugEnemy = function(init_xpos, init_ypos, speed_ratio, row) {
    Enemy.call(this, init_xpos, init_ypos, speed_ratio);
    this.cell = [-1, row];
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

//inherit from Enemy.prototype
BugEnemy.prototype = Object.create(Enemy.prototype);
BugEnemy.prototype.constructor = BugEnemy;

/* Update the enemy's position, required method for game
 * If the bug goes off the screen to the right, bring them back to a random position on the left(slightly offscreen)
 * @param   dt  a time delta between ticks
 */
BugEnemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (this.x >= ctx.canvas.width + X_OFFSET) {
        var randX = getRandomInt(2, 5);
        this.x = -(randX * X_OFFSET);
    }
};

// Draw the enemy on the screen, required method for game
BugEnemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* The character our users control
 * Keeps track of the cell its located in [col, row], the link to its sprite image, the number of lives,
 * and the total score
 * @constructor
 */
var Player = function() {
    this.cell = [2, 5];
    this.sprite = 'images/char-boy.png';
    this.lives = 3;
    this.score = 0;
};

// Draw the player on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.cell[0] * X_SCALE, this.cell[1] * Y_SCALE - 15);
};

/* For my implementation doesn't do anything
 * Updating the position is handled by the Player.handleInput function instead
 */
Player.prototype.update = function() {
    //this.cell[0] += x_moved;
    //this.cell[1] += y_moved;
};

/* Moves the player when the user presses the up,down,left,right keybuttons
 * Need to check before allowing the move whether its valid, ie that they don't move past the boundaries
 * Added in the additional functionality so that when the player hits 'gameover', they can press space to restart
 * @param   keyPressed  The key that the user pressed
 */
Player.prototype.handleInput = function(keyPressed) {
    switch (keyPressed) {
        case 'left':
            //console.log("MOVE LEFT");
            if (this.cell[0] != 0)
                this.cell[0] += -1;
            break;
        case 'up':
            //console.log("MOVE UP");
            if (this.cell[1] != 0)
                this.cell[1] += -1;
            break;
        case 'right':
            //console.log("MOVE RIGHT");
            if (this.cell[0] != NUMCOLS - 1)
                this.cell[0] += 1;
            break;
        case 'down':
            //console.log("MOVE DOWN");
            if (this.cell[1] != NUMROWS - 1)
                this.cell[1] += 1;
            break;
        case 'space':
            if (this.lives === 0) {
                this.lives = 3;
                this.score = 0;
            }
            break;
    }
};

/* Place all enemy objects in an array called allEnemies
 * In order to generate BugEnemy, I use mostly random numbers as parameters
 * The initial x position is a random left(offscreen) position which is multiplied by X_OFFSET for proper spacing
 * Initial y has to be in rows 1-3(no randomness) which is added to (Y_SCALE - Y_OFFSET) to align them in the center
 * The speed of the bugs is determined randomly from range [50, 100]
 * The last parameter is for the row that the bug is placed on
 */
var allEnemies = [];
for (var i = 0; i < NUM_ENEMIES; i++) {
    var y_placement = i % 3;
    var randX = getRandomInt(2, 20);
    var randSpeed = getRandomInt(50, 100);
    allEnemies.push(new BugEnemy(-randX * X_OFFSET, (Y_SCALE - Y_OFFSET) + y_placement * Y_SCALE, randSpeed, y_placement + 1));
}

// Place the player object in a variable called player
var player = new Player();

/**
 * Credit to MDN https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * @param   min     the min number the rand generator can return
 * @param   max     the max number the rand generator can return
 * @returns number  a randomly generated number between min and max
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/* This listens for key presses and sends the keys to your
 * Player.handleInput() method. You don't need to modify this.
 * Added in the space button as an extra legal key to allow restarts at 'gameover'
 */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    //console.log(allowedKeys[e.keyCode]);
    player.handleInput(allowedKeys[e.keyCode]);
});
