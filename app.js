/**
 * Chess Web Application - Main Game Logic
 * 
 * This file contains the core chess game functionality including:
 * - Board rendering and interaction
 * - Move validation and execution
 * - Game state management
 * - AI opponent integration
 * - Check/checkmate detection
 * - Drag-and-drop interface
 * 
 * Dependencies: chess.js library for game logic
 */

// === GLOBAL VARIABLES ===

/** @type {string|null} Color of the computer opponent ('w' for white, 'b' for black, null if disabled) */
let computerColor = null;

/** @type {boolean} Whether AI opponent is enabled */
let aiEnabled = true; // Track if AI opponent is enabled, also sets default value for it to be enabled

/** @type {HTMLElement} Main chessboard container element */
const boardElement = document.getElementById('chessboard');

const gameOverModal = document.getElementById('gameOverModal');
const gameOverMessage = document.getElementById('gameOverMessage');
const okButton = document.getElementById('okButton');
const anarchyButton = document.getElementById('anarchyButton');

/** @type {string[]} Chess board file labels (columns a-h) */
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/** @type {number[]} Chess board rank labels (rows 8-1) */
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

/** @type {Chess} Main chess game instance from chess.js library */
const chess = new Chess();

/** @type {string} Current player's board orientation ('white' or 'black') */
let playerOrientation = 'white'; // Default orientation

// === DRAG & DROP VARIABLES ===

/** @type {HTMLElement|null} Source element being dragged */
let dragSrcEl = null;

/** @type {string|null} Currently selected square (e.g., 'e4') */
let selectedSquare = null;

/** @type {HTMLElement[]} Array of legal move indicator elements */
let legalMoveIndicators = [];

// === CHESS PIECE CONSTANTS ===

/** @type {Object.<string, string>} Mapping of chess.js piece codes to full piece names */
const pieceMap = {
    'p': 'Pawn',
    'r': 'Rook',
    'n': 'Knight',
    'b': 'Bishop',
    'q': 'Queen',
    'k': 'King'
};

/** @type {string[]} Available pieces for pawn promotion (Queen, Rook, Bishop, Knight) */
const promotionPieces = ['q', 'r', 'b', 'n']; // Queen, Rook, Bishop, Knight being the pieces that pawn can be promoted to

function showGameOverDialog(reason) {
  let message = '';
  if (reason === 'checkmate') {
    message = 'You got yourself a <span class="stylized-chess">checkmate</span>.';
  } else if (reason === 'stalemate') {
    message = 'You got yourself a <span class="stylized-chess">stalemate</span>.';
  } else if (reason === 'draw') {
    message = 'The game is a <span class="stylized-chess">draw</span>.';
  }
  gameOverMessage.innerHTML = message;
  gameOverModal.style.display = 'flex';
}

// === PROMOTION DIALOG FUNCTIONS ===

/**
 * Shows the pawn promotion dialog when a pawn reaches the opposite end
 * @param {string} from - Source square (e.g., 'e7')
 * @param {string} to - Destination square (e.g., 'e8')
 */
function showPromotionDialog(from, to) {
    const overlay = document.getElementById('promotion-overlay');
    const choicesContainer = document.getElementById('promotion-choices');
    choicesContainer.innerHTML = '';

    const turn = chess.turn();

    // Create promotion choice buttons for each available piece
    promotionPieces.forEach(p => {
        const button = document.createElement('div');
        button.classList.add('promotion-piece');
        
        const pieceImg = document.createElement('img');
        pieceImg.src = `images/${turn}${pieceMap[p].toLowerCase()}.png`;
        pieceImg.alt = pieceMap[p];
        
        button.appendChild(pieceImg);

        // Handle promotion piece selection
        button.addEventListener('click', () => {
            movePiece(from, to, p);
            overlay.classList.add('hidden');
        });
        choicesContainer.appendChild(button);
    });

    overlay.classList.remove('hidden');
}

// === BOARD CREATION AND RENDERING ===

/**
 * Creates the visual chess board with all squares and coordinate labels
 * Handles board orientation based on player color and sets up event listeners
 */
function createBoard() {
    boardElement.innerHTML = '';
    
    // Arrange board based on player orientation (white on bottom vs black on bottom)
    const boardRanks = playerOrientation === 'white' ? [...ranks] : [...ranks].reverse();
    const boardFiles = playerOrientation === 'white' ? [...files] : [...files].reverse();

    // Generate each square on the board
    for (const rank of boardRanks) {
        for (const file of boardFiles) {
            const square = document.createElement('div');
            square.classList.add('square');

            // Use original indices for proper checkerboard color calculation
            const rankIdx = ranks.indexOf(rank);
            const fileIdx = files.indexOf(file);

            // Determine square color (light/dark pattern)
            const isLightSquare = (rankIdx + fileIdx) % 2 !== 0;
            square.classList.add(isLightSquare ? 'light' : 'dark');
            square.dataset.square = file + rank;

            // Add coordinate labels (rank numbers and file letters)
            if (boardFiles.indexOf(file) === 0) {
                const rankLabel = document.createElement('div');
                rankLabel.classList.add('rank-label');
                rankLabel.textContent = rank;
                rankLabel.style.color = isLightSquare ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
                square.appendChild(rankLabel);
            }
            if (boardRanks.indexOf(rank) === (boardRanks.length - 1)) {
                const fileLabel = document.createElement('div');
                fileLabel.classList.add('file-label');
                fileLabel.textContent = file;
                fileLabel.style.color = isLightSquare ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
                square.appendChild(fileLabel);
            }

            // Set up event listeners for drag-and-drop and click interactions
            square.addEventListener('dragover', handleDragOver);
            square.addEventListener('drop', handleDrop);
            square.addEventListener('click', handleSquareClick);
            boardElement.appendChild(square);
        }
    }
    updateBoard();
}

/**
 * Updates the visual board to match the current chess game state
 * Clears existing pieces and places them according to chess.js board position
 */
function updateBoard() {
    // Clear all existing piece images from the board
    document.querySelectorAll('.piece').forEach(p => p.remove());

    // Place pieces based on current chess.js board state
    chess.board().forEach((row, rankIdx) => {
        row.forEach((piece, fileIdx) => {
            if (piece) {
                // Convert array indices to chess notation (e.g., [0,0] -> 'a8')
                const squareName = files[fileIdx] + (8 - rankIdx);
                const squareElement = document.querySelector(`[data-square="${squareName}"]`);
                
                // Create piece image element
                const pieceImg = document.createElement('img');
                pieceImg.classList.add('piece');
                pieceImg.src = `images/${piece.color}${pieceMap[piece.type].toLowerCase()}.png`;
                pieceImg.alt = `${piece.color}${pieceMap[piece.type]}`;
                
                // Add piece to square and enable dragging
                squareElement.appendChild(pieceImg);
                squareElement.draggable = true;
                squareElement.addEventListener('dragstart', handleDragStart);
                squareElement.addEventListener('dragend', handleDragEnd);
            }
        });
    });
    
    // Update all game status indicators
    updateTurnIndicator();
    updateCheckStatus(); // Check for check/checkmate status
    updateLastMoveIndicator(); // Highlight the most recent move
}

// === MOVE VALIDATION AND LEGAL MOVES ===

/**
 * Gets all legal destination squares for a piece on a given square
 * @param {string} fromSquare - Square to check moves from (e.g., 'e4')
 * @returns {string[]} Array of legal destination squares
 */
function getLegalMoves(fromSquare) {
    const moves = chess.moves({
        square: fromSquare,
        verbose: true
    });
    return moves.map(move => move.to);
}

// === SQUARE CLICK HANDLING ===

/**
 * Handles clicking on chess board squares for piece selection and movement
 * @param {Event} e - Click event object
 */
function handleSquareClick(e) {
    e.stopPropagation();
    const clickedSquareEl = e.currentTarget;
    const clickedSquare = clickedSquareEl.dataset.square;
    const piece = chess.get(clickedSquare);

    // If a piece is already selected
    if (selectedSquare) {
        // If clicking a legal move destination, execute the move
        if (clickedSquareEl.classList.contains('legal-move')) {
            attemptMove(selectedSquare, clickedSquare);
            return;
        }
        
        // If clicking the same square again, deselect it
        if (selectedSquare === clickedSquare) {
            clearSelectionAndIndicators();
            return;
        }
    }

    // If no piece on square or it's the wrong player's turn, clear selection
    if (!piece || piece.color !== chess.turn()) {
        clearSelectionAndIndicators();
        return;
    }

    // Select the piece and show all its legal moves
    clearSelectionAndIndicators();
    selectedSquare = clickedSquare;
    clickedSquareEl.classList.add('selected');
    const legalMoves = getLegalMoves(clickedSquare);
    showLegalMoveIndicators(legalMoves);
}

/**
 * Attempts to make a move, handling special cases like pawn promotion
 * @param {string} from - Source square
 * @param {string} to - Destination square
 */
function attemptMove(from, to) {
    // Check if this would be a pawn promotion move
    const piece = chess.get(from);
    let isPromotionMove = false;
    
    if (piece && piece.type === 'p') {
        const toRank = to.charAt(1);
        // Check if pawn is moving to the promotion rank (8th for white, 1st for black)
        if ((piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1')) {
            // Test if this is a legal promotion move by trying with queen promotion
            const testMove = chess.move({ from, to, promotion: 'q' });
            if (testMove) {
                // It's a legal promotion move, undo the test and show promotion dialog
                chess.undo();
                isPromotionMove = true;
            }
        }
    }
    
    if (isPromotionMove) {
        showPromotionDialog(from, to);
    } else {
        movePiece(from, to);
    }
}

// === MOVE EXECUTION ===

/**
 * Executes a chess move and updates the game state
 * @param {string} from - Source square (e.g., 'e2')
 * @param {string} to - Destination square (e.g., 'e4')
 * @param {string} [promotion] - Promotion piece for pawn promotion ('q', 'r', 'b', 'n')
 */
function movePiece(from, to, promotion) {
    const move = chess.move({ from, to, promotion });

    if (move === null) {
        // Move is illegal - flash the source square to indicate error
        flashSquare(document.querySelector(`[data-square="${from}"]`));
        return;
    }

    // Add move to history UI if available
    if (typeof moveHistoryUI !== 'undefined' && moveHistoryUI && move) {
        const moveCount = chess.history().length;
        moveHistoryUI.addMove(move, moveCount);
    }

    // Update the visual board and clear any selection indicators
    updateBoard();
    clearSelectionAndIndicators();

    // Check for game ending conditions
    if (chess.game_over()) {
        let reason = '';
        if (chess.in_checkmate()) {
          reason = 'checkmate';
        } else if (chess.in_stalemate()) {
          reason = 'stalemate';
        } else if (chess.in_draw()) {
          reason = 'draw';
        }
        showGameOverDialog(reason);
        return;
    }

    // If AI is enabled and it's now the computer's turn, make AI move
    if (aiEnabled && chess.turn() === computerColor) {
      setTimeout(makeStockfishMove, 300); // Add slight delay for more natural feel
    }
}

// === LEGAL MOVE INDICATORS ===

/**
 * Shows visual indicators for all legal moves from the selected piece
 * @param {string[]} moves - Array of legal destination squares
 */
function showLegalMoveIndicators(moves) {
    moves.forEach(move => {
        const squareElement = document.querySelector(`[data-square="${move}"]`);
        if (squareElement) {
            const indicator = document.createElement('div');
            indicator.classList.add('legal-move-indicator');
            
            // Different indicator style for capture moves
            if (chess.get(move)) { // Square contains an opponent piece
                indicator.classList.add('capture-indicator');
            }
            
            squareElement.appendChild(indicator);
            squareElement.classList.add('legal-move');
            legalMoveIndicators.push(indicator);
        }
    });
}

/**
 * Clears the current piece selection and removes all move indicators
 */
function clearSelectionAndIndicators() {
    if (selectedSquare) {
        const el = document.querySelector('.selected');
        if (el) el.classList.remove('selected');
        selectedSquare = null;
    }
    
    // Remove all legal move indicator elements
    legalMoveIndicators.forEach(indicator => indicator.remove());
    legalMoveIndicators = [];
    
    // Remove legal move classes from squares
    document.querySelectorAll('.legal-move').forEach(square => {
        square.classList.remove('legal-move');
    });
}

/**
 * Flashes a square red to indicate an illegal move or error
 * @param {HTMLElement} square - The square element to flash
 */
function flashSquare(square) {
    if (!square) return;
    square.classList.add('flash-error');
    setTimeout(() => {
        square.classList.remove('flash-error');
    }, 600);
}

// === DRAG & DROP HANDLERS ===

/**
 * Handles the start of a drag operation for chess pieces
 * @param {DragEvent} e - Drag start event
 */
function handleDragStart(e) {
    const pieceSquare = e.target.dataset.square;
    const piece = chess.get(pieceSquare);

    // Prevent dragging if no piece or wrong turn
    if (!piece || piece.color !== chess.turn()) {
        e.preventDefault();
        return;
    }

    dragSrcEl = e.target;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', pieceSquare);

    // Make dragged piece semi-transparent for visual feedback
    const pieceElement = e.target.querySelector('.piece');
    if (pieceElement) {
        pieceElement.style.opacity = '0.5';
    }

    // Show legal moves when dragging starts
    clearSelectionAndIndicators();
    selectedSquare = pieceSquare;
    const legalMoves = getLegalMoves(pieceSquare);
    showLegalMoveIndicators(legalMoves);
}

/**
 * Handles the end of a drag operation, restoring piece opacity
 * @param {DragEvent} e - Drag end event
 */
function handleDragEnd(e) {
    const pieceElement = e.target.querySelector('.piece');
    if (pieceElement) {
        pieceElement.style.opacity = '1';
    }
    // Clear indicators after a short delay to allow drop to process
    setTimeout(clearSelectionAndIndicators, 100);
}

/**
 * Handles drag over events to allow dropping
 * @param {DragEvent} e - Drag over event
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

/**
 * Handles dropping a piece on a square
 * @param {DragEvent} e - Drop event
 */
function handleDrop(e) {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain');
    let toSquareEl = e.target;

    // If dropped on a piece image, get the parent square element
    if (toSquareEl.classList.contains('piece')) {
        toSquareEl = toSquareEl.parentElement;
    }
    
    // Only allow drops on legal move squares
    if (!toSquareEl.classList.contains('legal-move')) {
        return;
    }
    
    const toSquare = toSquareEl.dataset.square;
    attemptMove(fromSquare, toSquare);
}

// === GAME STATUS INDICATORS ===

/**
 * Updates the turn indicator to show whose turn it is
 */
function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    if (indicator) {
        const turn = chess.turn() === 'w' ? 'White' : 'Black';
        indicator.textContent = `Current turn: ${turn}`;
        indicator.style.color = turn === 'White' ? '#2c3e50' : '#34495e';
    }
}

/**
 * Returns appropriate game over message based on the game state
 * @returns {string} Game over message
 */
function getGameOverText() {
    if (chess.in_checkmate()) {
        return `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins.`;
    }
    if (chess.in_draw()) {
        let reason = 'Draw!';
        if (chess.in_stalemate()) reason = 'Stalemate!';
        if (chess.in_threefold_repetition()) reason = 'Draw by threefold repetition!';
        if (chess.insufficient_material()) reason = 'Draw by insufficient material!';
        return reason;
    }
    return '';
}

// === CHECK STATUS MANAGEMENT ===

/**
 * Updates visual indicators for check status (highlights king in check and attacking pieces)
 */
function updateCheckStatus() {
    const currentCheckSquares = document.querySelectorAll('.king-in-check');
    const currentAttackingSquares = document.querySelectorAll('.attacking-piece');
    
    console.log('updateCheckStatus called, in_check:', chess.in_check());
    
    // If the current player is in check, highlight their king and the attacking piece(s)
    if (chess.in_check()) {
        const kingSquare = findKingSquare(chess.turn());
        console.log('King in check at square:', kingSquare);
        
        if (kingSquare) {
            const kingElement = document.querySelector(`[data-square="${kingSquare}"]`);
            if (kingElement && !kingElement.classList.contains('king-in-check')) {
                // Remove any existing check indicators first
                currentCheckSquares.forEach(square => {
                    square.classList.remove('king-in-check');
                });
                // Add check indicator to the current king
                kingElement.classList.add('king-in-check');
            }
        }

        // Remove any existing attacking piece indicators
        currentAttackingSquares.forEach(attackSquare => {
            attackSquare.classList.remove('attacking-piece');
        });

        // Find and highlight the piece(s) giving check
        const attackingSquares = findAttackingPieces(chess.turn());
        console.log('Found attacking squares:', attackingSquares);
        
        attackingSquares.forEach(square => {
            const squareElement = document.querySelector(`[data-square="${square}"]`);
            console.log('Adding attacking-piece class to square:', square, squareElement);
            if (squareElement) {
                squareElement.classList.add('attacking-piece');
            }
        });
    } else {
        // Check is being resolved - play shrink animation before removing indicators
        currentCheckSquares.forEach(square => {
            square.classList.add('king-check-ending');
            // Remove all classes after animation completes
            setTimeout(() => {
                square.classList.remove('king-in-check', 'king-check-ending');
            }, 300); // Match the shrink animation duration
        });

        // Remove attacking piece indicators with animation
        currentAttackingSquares.forEach(square => {
            square.classList.add('attacking-piece-ending');
            // Remove all classes after animation completes
            setTimeout(() => {
                square.classList.remove('attacking-piece', 'attacking-piece-ending');
            }, 300); // Match the shrink animation duration
        });
    }
}

/**
 * Updates visual indicators to highlight the most recent move
 */
function updateLastMoveIndicator() {
    // Remove any existing last move indicators
    document.querySelectorAll('.last-move-from, .last-move-to').forEach(square => {
        square.classList.remove('last-move-from', 'last-move-to');
    });
    
    // Get the last move from game history
    const history = chess.history({ verbose: true });
    if (history.length > 0) {
        const lastMove = history[history.length - 1];
        
        // Highlight the source square
        const fromSquare = document.querySelector(`[data-square="${lastMove.from}"]`);
        if (fromSquare) {
            fromSquare.classList.add('last-move-from');
        }
        
        // Highlight the destination square
        const toSquare = document.querySelector(`[data-square="${lastMove.to}"]`);
        if (toSquare) {
            toSquare.classList.add('last-move-to');
        }
        
        console.log(`Last move: ${lastMove.piece} from ${lastMove.from} to ${lastMove.to}`);
    }
}

// === HELPER FUNCTIONS FOR CHECK DETECTION ===

/**
 * Finds the square where the king of the specified color is located
 * @param {string} color - King color ('w' for white, 'b' for black)
 * @returns {string|null} Square name (e.g., 'e1') or null if not found
 */
function findKingSquare(color) {
    const board = chess.board();
    for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
        for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
            const piece = board[rankIdx][fileIdx];
            if (piece && piece.type === 'k' && piece.color === color) {
                return files[fileIdx] + (8 - rankIdx);
            }
        }
    }
    return null;
}

/**
 * Finds all pieces that are currently attacking the king of the specified color
 * @param {string} kingColor - Color of the king being attacked ('w' or 'b')
 * @returns {string[]} Array of squares containing attacking pieces
 */
function findAttackingPieces(kingColor) {
    const attackingSquares = [];
    const kingSquare = findKingSquare(kingColor);
    
    if (!kingSquare) return attackingSquares;

    console.log(`Finding pieces attacking ${kingColor} king at ${kingSquare}`);
    
    const oppositeColor = kingColor === 'w' ? 'b' : 'w';
    
    // First, check the piece that just moved (most likely to be giving check)
    const history = chess.history({ verbose: true });
    if (history.length > 0) {
        const lastMove = history[history.length - 1];
        
        // Check if the piece that just moved is giving check
        const movedPiece = chess.get(lastMove.to);
        if (movedPiece && movedPiece.color === oppositeColor) {
            console.log(`Checking if ${movedPiece.type} at ${lastMove.to} is giving check`);
            
            if (isSquareAttackedByPiece(movedPiece, lastMove.to, kingSquare)) {
                attackingSquares.push(lastMove.to);
                console.log(`Last moved piece is giving check!`);
            }
        }
        
        // Check for discovered attacks (piece moved away revealing another attacker)
        if (lastMove.from) {
            const board = chess.board();
            for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
                for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
                    const piece = board[rankIdx][fileIdx];
                    if (piece && piece.color === oppositeColor) {
                        const pieceSquare = files[fileIdx] + (8 - rankIdx);
                        
                        // Skip the piece we already checked
                        if (pieceSquare === lastMove.to) continue;
                        
                        if (isSquareAttackedByPiece(piece, pieceSquare, kingSquare)) {
                            if (!attackingSquares.includes(pieceSquare)) {
                                attackingSquares.push(pieceSquare);
                                console.log(`Found discovered attack from ${piece.type} at ${pieceSquare}`);
                            }
                        }
                    }
                }
            }
        }
    }
    
    // If no attackers found yet, scan the entire board
    if (attackingSquares.length === 0) {
        console.log('No attackers found in last move, doing full scan...');
        const board = chess.board();
        for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
            for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
                const piece = board[rankIdx][fileIdx];
                if (piece && piece.color === oppositeColor) {
                    const pieceSquare = files[fileIdx] + (8 - rankIdx);
                    
                    if (isSquareAttackedByPiece(piece, pieceSquare, kingSquare)) {
                        attackingSquares.push(pieceSquare);
                        console.log(`Full scan found attacking piece ${piece.type} at ${pieceSquare}`);
                    }
                }
            }
        }
    }
    
    console.log('Final attacking squares:', attackingSquares);
    return attackingSquares;
}

/**
 * Simplified wrapper function for checking if a piece can attack a square
 * @param {Object} piece - Chess piece object
 * @param {string} fromSquare - Source square
 * @param {string} toSquare - Target square
 * @returns {boolean} True if piece can attack the target square
 */
function canPieceAttackSquare(piece, fromSquare, toSquare) {
    // Simple wrapper - just use the main attack logic
    return isSquareAttackedByPiece(piece, fromSquare, toSquare);
}

/**
 * Determines if a piece can attack a specific square based on piece movement rules
 * @param {Object} piece - Chess piece object with type and color properties
 * @param {string} fromSquare - Source square (e.g., 'e4')
 * @param {string} toSquare - Target square (e.g., 'e5')
 * @returns {boolean} True if the piece can attack the target square
 */
function isSquareAttackedByPiece(piece, fromSquare, toSquare) {
    const fromFile = fromSquare.charCodeAt(0) - 'a'.charCodeAt(0);
    const fromRank = parseInt(fromSquare[1]) - 1;
    const toFile = toSquare.charCodeAt(0) - 'a'.charCodeAt(0);
    const toRank = parseInt(toSquare[1]) - 1;
    
    const fileDiff = Math.abs(toFile - fromFile);
    const rankDiff = Math.abs(toRank - fromRank);
    
    switch (piece.type) {
        case 'p': // Pawn - attacks diagonally one square
            const direction = piece.color === 'w' ? 1 : -1;
            return (rankDiff === 1 && fileDiff === 1 && (toRank - fromRank) === direction);
            
        case 'r': // Rook - attacks horizontally or vertically
            return (fileDiff === 0 || rankDiff === 0) && isPathClear(fromSquare, toSquare);
            
        case 'n': // Knight - attacks in L-shape
            return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
            
        case 'b': // Bishop - attacks diagonally
            return fileDiff === rankDiff && isPathClear(fromSquare, toSquare);
            
        case 'q': // Queen - combines rook and bishop movement
            return ((fileDiff === 0 || rankDiff === 0) || (fileDiff === rankDiff)) && isPathClear(fromSquare, toSquare);
            
        case 'k': // King - attacks one square in any direction
            return fileDiff <= 1 && rankDiff <= 1;
            
        default:
            return false;
    }
}

/**
 * Checks if the path between two squares is clear of pieces (for sliding pieces)
 * @param {string} fromSquare - Starting square (e.g., 'a1')
 * @param {string} toSquare - Ending square (e.g., 'h8')
 * @returns {boolean} True if path is clear, false if blocked
 */
function isPathClear(fromSquare, toSquare) {
    const fromFile = fromSquare.charCodeAt(0) - 'a'.charCodeAt(0);
    const fromRank = parseInt(fromSquare[1]) - 1;
    const toFile = toSquare.charCodeAt(0) - 'a'.charCodeAt(0);
    const toRank = parseInt(toSquare[1]) - 1;
    
    const fileDiff = toFile - fromFile;
    const rankDiff = toRank - fromRank;
    const steps = Math.max(Math.abs(fileDiff), Math.abs(rankDiff));
    
    if (steps <= 1) return true; // Adjacent squares or same square
    
    // Calculate step direction for each axis
    const fileStep = fileDiff === 0 ? 0 : fileDiff / Math.abs(fileDiff);
    const rankStep = rankDiff === 0 ? 0 : rankDiff / Math.abs(rankDiff);
    
    const board = chess.board();
    
    // Check each square along the path (excluding start and end squares)
    for (let i = 1; i < steps; i++) {
        const checkFile = fromFile + (fileStep * i);
        const checkRank = fromRank + (rankStep * i);
        
        if (board[7 - checkRank][checkFile] !== null) {
            return false; // Path is blocked by a piece
        }
    }
    
    return true; // Path is clear
}


// === AI OPPONENT FUNCTIONS ===

/**
 * Makes the AI opponent (Stockfish engine) play a move
 * Only executes if it's the computer's turn and the game isn't over
 */
function makeStockfishMove() {
    if (chess.game_over()) return;

    if (chess.turn() === computerColor) {
        fetchStockfishMove(chess.fen(), function(move) {
            if (!move || move.length < 4) return;
            
            // Parse move string (e.g., 'e2e4' or 'e7e8q' for promotion)
            const from = move.substr(0, 2);
            const to = move.substr(2, 2);
            let promotion = null;
            if (move.length > 4) {
                promotion = move[4]; // e.g. 'q' for queen promotion
            }
            movePiece(from, to, promotion);
        });
    }
}

// === GAME INITIALIZATION AND EVENT LISTENERS ===

/**
 * Main initialization function - sets up the game when the page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    const introOverlay = document.getElementById('intro-overlay');
    const gameWrapper = document.getElementById('game-wrapper');
    const mainTitle = document.querySelector('h1.hidden');
    const whiteButton = document.getElementById('play-white');
    const blackButton = document.getElementById('play-black');

    /**
     * Starts a new game with the specified player orientation
     * @param {string} orientation - Player's color and board orientation ('white' or 'black')
     */
    function startGame(orientation) {
        playerOrientation = orientation;
        // Computer plays the opposite color from the player
        computerColor = orientation === 'white' ? 'b' : 'w';
        
        // Hide intro overlay and show game interface
        introOverlay.classList.add('hidden');
        gameWrapper.classList.remove('hidden');
        
        // Show move history panel
        const moveHistoryPanel = document.getElementById('move-history-panel');
        if (moveHistoryPanel) {
            moveHistoryPanel.classList.remove('hidden');
        }
        
        // Initialize move history UI if not already initialized
        if (typeof moveHistoryUI === 'undefined' || !moveHistoryUI) {
            if (typeof MoveHistoryUI !== 'undefined') {
                moveHistoryUI = new MoveHistoryUI();
            }
        }
        
        // Show main title and create the board
        if(mainTitle) mainTitle.classList.remove('hidden');
        createBoard();

        // If computer plays white and AI is enabled, let the engine make the first move
        if (aiEnabled && computerColor === 'w') {
          makeStockfishMove();
        }
    }

    // Set up color selection buttons
    whiteButton.addEventListener('click', () => startGame('white'));
    blackButton.addEventListener('click', () => startGame('black'));
    
    // Handle AI opponent toggle
    const aiToggle = document.getElementById('ai-enabled');
    aiToggle.addEventListener('change', function() {
        aiEnabled = this.checked;
        console.log('AI opponent:', aiEnabled ? 'enabled' : 'disabled');
        
        // If AI was just enabled and it's the computer's turn, make a move
        if (aiEnabled && chess.turn() === computerColor && !chess.game_over()) {
            setTimeout(makeStockfishMove, 500);
        }
    });

    // Clear piece selection when clicking outside the board
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#chessboard')) {
            clearSelectionAndIndicators();
        }
    });
});

okButton.addEventListener('click', () => {
  gameOverModal.style.display = 'none';
});

anarchyButton.addEventListener('click', () => {
  window.open('https://www.reddit.com/r/AnarchyChess/', '_blank');
  gameOverModal.style.display = 'none';
});
