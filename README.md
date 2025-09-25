# webapp-chess
Chess webapp, with stockfish integration
Built for **siege week 4** (practice) on hackclub. All it does is allow you to play chess on a super simple website with either yourself or stockfish. Although, I'm making this so that I can fiddle around with stockfish a bit...

The entire point of this project is to help me in making more interactive websites and give me some experience in how to integrate opensource stuff in them.

## Stuff I wanna add:
- Toggles for:
    - Using keyboard keystrokes to move the pieces/using mouse to move the pieces
- View of previous moves and such on the side bar with the proper notation
    - Should also add a feature to be able to export that, maybe will help in further analysis of the game
- Make the gameplay a bit more fluid, I dunno how to do that but there must be a way no?

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
        - ```<script src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"></script>```
    - Added an intro screen, and choice picker as to what they'd wanna play as
    - Added promotion screen, so that if the pawn reaches the farthest rank then it can be promoted to either: Queen, Rook, Knight, or Bishop
    - Integrated stockfish functionality
        - Enountered CORS (Cross-Origin Resource Sharing) error when tried to load stockfish as a webworker, apparently browsers block this when running stuff locally...
        - Added a custom chess engine worker ```stockfish-worker.js``` 
            - it runs in a seperate thread and doesn't block any UI
            Impliments basic UCI (Universal Chess Interface) commands
            - Uses chess.js (the external library) to generate ONLY legal moves
        - Main engine interface file: ```stockfish.js```
            - Creates & manages the chessworker
            - Handles the UCI
            - Provides the move requests
        - FEN integration makes it work with any board position
        - Engine also automatically retries to start if "engine not ready" error comes
        - Also added ai toggle, so can only use stockfish for a few moves if wanting to.
- 25 Sept 2025
    -