# webapp-chess
Chess webapp, with stockfish integration
Built for siege week 4 (practice) on hackclub. All it does is allow you to play chess on a super simple website with either yourself or stockfish. Although, I'm making this so that I can fiddle around with stockfish a bit...

The entire point of this project is to help me in making more interactive websites and give me some experience in how to integrate opensource stuff in them.

## Stuff I wanna add:
- Check and Checkmate systems for the king via various moves
- Stockfish
- An intro screen where one can pick wether they wanna play as black or white
- Toggles for:
    - Using keyboard keystrokes to move the pieces/using mouse to move the pieces
- View of previous moves and such on the side bar with the proper notation
    - Should also add a feature to be able to export that, maybe will help in further analysis of the game
- Make the background dark, can't flash bang the cave dwellers...
- Add icons for the pieces
- Make the gameplay a bit more fluid, I dunno how to do that but there must be a way no?
- Add a way to maybe flip the board? will need to see how I can do that tbh...

## Devlogs:
- 23 Sept 2025
    - Created the project
    - Added index.html, style.css, and app.js files and updated base code
    - Made a square chess board along with movable pieces
        - Currently they're just letters, but we'll see if I can design some of them...
    - Added square number/alphabets to the board
        - Will alternate in colours, depending on which colour square they are on
    - Added system for legal moves and showcase it
- 24 Sept 2025
    - Removed all that BS for legal moves, used an external library "chess.js" instead for that cause I aint too good abt it bruh...
