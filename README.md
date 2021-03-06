# Classic Arcade Game Clone Frogger

This is a remake of the Arcade Game **Frogger** implemented in JavaScript. The user controls the player with the arrow keys and attempts to make his/her way to the goal. Colliding into the enemy bugs will result in the player losing a life and starting over in the start position. Added in the additional functionality of keeping track of scores and showing a restart screen when the player's lives reach 0.

## Getting Started

To demo the app, visit the link [here] (https://myounglim.github.io/classic-arcade-game-clone) You can also clone the repo then open _index.html_ in the browser of your choice to run the game. Use the arrow keys to move the player and avoid the enemies to make your way to the other side of the road.

### Issues

When running the app locally on the Google Chrome browser, the browser will not allow the Restart Screen to function due to a CORS issue. Using a different browser like Firefox will get around this issue or alternatively, you can set up a Web Server before running the file in Chrome. You can run something like this in the command line `python -m SimpleHTTPServer` then navigate your browser to localhost:8000. You can read more about this issue at [MDN] (https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)