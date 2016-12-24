/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        if (!gameOver()) {
            updateEntities(dt);
            checkCollisions();
            checkGoalReached();
        }
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
        drawLivesAndScore();

        //if player's lives reach 0, display a gameover screen and make the image grayscale
        if (gameOver()) {
            makeGrayScale();
            displayGameOver();
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    /* Check for collisions between the player and a bug
     * Loop through all the enemies and first check whether an enemy bug and the player are on the same row
     * If they are on the same row, then check whether the x coordinate of the player(with added width) overlaps
     * with the x coordinate of the bug(with added width)
     * If a collision occurs, bring the player back to starting position and decrement the player's lives
     */
    function checkCollisions() {
        allEnemies.forEach(function(enemy) {
            if (enemy.cell[1] == player.cell[1]) {
                if (player.cell[0] * X_SCALE + 10 < enemy.x + IMAGE_WIDTH && player.cell[0] * X_SCALE + IMAGE_WIDTH - 10 > enemy.x) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    player.cell = [2, 5];
                    player.lives--;
                }
            }
        });
    }

    // Display the current lives and score of the player
    function drawLivesAndScore() {
        ctx.fillText("LIVES: " + player.lives, 0, 35);
        ctx.fillText("SCORE: " + player.score, canvas.width/2 + 50, 35);
    }

    /* If player has reached the goal which is when player is at first row (row 0)
     * Put the player back at their starting position and increase the player's score by 100
     * Need to clear the canvas beforehand otherwise the text gets written over and looks blurry
     */
    function checkGoalReached() {
        if (player.cell[1] == 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            player.cell = [2, 5];
            player.score += 100;
        }
    }

    /* checks whether game is over
     * @returns  boolean
     */
    function gameOver() {
        return player.lives == 0;
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        ctx.font = "24px serif";
        ctx.fillStyle = "gray";
    }

    /* Credit to Udacity's HTML 5 Canvas course at https://www.udacity.com/course/html5-canvas--ud292
     * Gives the canvas image a 'greyed' out look by manipulating the r,g,b values
     * @param   r
     * @param   g
     * @param   b
     * @param   a
     */
    function makePixelGrayScale (r,g,b,a) {
        var y = (0.3 * r) + (0.59 * g) + (0.11 * b);
        return {r:y, g:y, b:y, a:y};
    }

    function makeGrayScale() {
        var r,g,b,a;
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var numPixels = imageData.data.length / 4;
        for (var i = 0; i < numPixels; i++) {
            r = imageData.data[i * 4 + 0];
            g = imageData.data[i * 4 + 1];
            b = imageData.data[i * 4 + 2];
            a = imageData.data[i * 4 + 3];
            pixel = makePixelGrayScale(r,g,b,a);
            imageData.data[i * 4 + 0] = pixel.r;
            imageData.data[i * 4 + 1] = pixel.g;
            imageData.data[i * 4 + 2] = pixel.b;
            imageData.data[i * 4 + 3] = pixel.a;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    /* Displays the GAMEOVER screen when the player's lives hit 0
     * Use the width and height of the canvas as starting points to properly align the text
     */
    function displayGameOver() {
        ctx.strokeText("GAME OVER", canvas.width / 2 - 75, canvas.height / 2 - 75);
        ctx.strokeText("PRESS SPACE TO PLAY AGAIN", canvas.width / 2 - 165, canvas.height / 2 - 25);
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
