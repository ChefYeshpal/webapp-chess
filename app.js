// Using chess.js for game logic
const boardElement = document.getElementById('chessboard');
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

const chess = new Chess();
let playerOrientation = 'white'; // Default orientation

let dragSrcEl = null;
let selectedSquare = null;
let legalMoveIndicators = [];

const pieceMap = {
    'p': 'Pawn',
    'r': 'Rook',
    'n': 'Knight',
    'b': 'Bishop',
    'q': 'Queen',
    'k': 'King'
};

function isPromotion(from, to) {
    const piece = chess.get(from);
    if (!piece || piece.type !== 'p') return false;
    const toRank = to.charAt(1);
    if (piece.color === 'w' && toRank === '8') return true;
    if (piece.color === 'b' && toRank === '1') return true;
    return false;
}

function showPromotionDialog(from, to) {
    const overlay = document.getElementById('promotion-overlay');
    const choicesContainer = document.getElementById('promotion-choices');
    choicesContainer.innerHTML = '';

    const promotionPieces = ['q', 'r', 'b', 'n'];
    const pieceSymbols = { 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞' };
    const turn = chess.turn();

    promotionPieces.forEach(p => {
        const button = document.createElement('div');
        button.classList.add('promotion-piece');
        button.textContent = pieceSymbols[p];
        button.style.color = turn === 'w' ? '#eee' : '#222';
        button.addEventListener('click', () => {
            movePiece(from, to, p);
            overlay.classList.add('hidden');
        });
        choicesContainer.appendChild(button);
    });

    overlay.classList.remove('hidden');
}

function createBoard() {
    boardElement.innerHTML = '';
    const boardRanks = playerOrientation === 'white' ? [...ranks] : [...ranks].reverse();
    const boardFiles = playerOrientation === 'white' ? [...files] : [...files].reverse();

    for (const rank of boardRanks) {
        for (const file of boardFiles) {
            const square = document.createElement('div');
            square.classList.add('square');

            // Use original indices for color calculation
            const rankIdx = ranks.indexOf(rank);
            const fileIdx = files.indexOf(file);

            const isLightSquare = (rankIdx + fileIdx) % 2 !== 0;
            square.classList.add(isLightSquare ? 'light' : 'dark');
            square.dataset.square = file + rank;

            // Add coordinate labels
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

            square.addEventListener('dragover', handleDragOver);
            square.addEventListener('drop', handleDrop);
            square.addEventListener('click', handleSquareClick);
            boardElement.appendChild(square);
        }
    }
    updateBoard();
}

function updateBoard() {
    // Clear all pieces
    document.querySelectorAll('.piece').forEach(p => p.remove());

    // Place pieces based on chess.js board state
    chess.board().forEach((row, rankIdx) => {
        row.forEach((piece, fileIdx) => {
            if (piece) {
                const squareName = files[fileIdx] + (8 - rankIdx);
                const squareElement = document.querySelector(`[data-square="${squareName}"]`);
                
                const pieceSpan = document.createElement('span');
                pieceSpan.classList.add('piece');
                pieceSpan.textContent = `${piece.color}${pieceMap[piece.type]}`; // e.g., wPawn
                
                squareElement.appendChild(pieceSpan);
                squareElement.draggable = true;
                squareElement.addEventListener('dragstart', handleDragStart);
                squareElement.addEventListener('dragend', handleDragEnd);
            }
        });
    });
    updateTurnIndicator();
}

function getLegalMoves(fromSquare) {
    const moves = chess.moves({
        square: fromSquare,
        verbose: true
    });
    return moves.map(move => move.to);
}

function handleSquareClick(e) {
    e.stopPropagation();
    const clickedSquareEl = e.currentTarget;
    const clickedSquare = clickedSquareEl.dataset.square;
    const piece = chess.get(clickedSquare);

    // If a piece is already selected
    if (selectedSquare) {
        // If clicking a legal move, make the move
        if (clickedSquareEl.classList.contains('legal-move')) {
            attemptMove(selectedSquare, clickedSquare);
            return;
        }
        
        // Deselect if clicking the same square
        if (selectedSquare === clickedSquare) {
            clearSelectionAndIndicators();
            return;
        }
    }

    // If no piece or wrong turn, do nothing or deselect
    if (!piece || piece.color !== chess.turn()) {
        clearSelectionAndIndicators();
        return;
    }

    // Select the piece and show legal moves
    clearSelectionAndIndicators();
    selectedSquare = clickedSquare;
    clickedSquareEl.classList.add('selected');
    const legalMoves = getLegalMoves(clickedSquare);
    showLegalMoveIndicators(legalMoves);
}

function attemptMove(from, to) {
    if (isPromotion(from, to)) {
        showPromotionDialog(from, to);
    } else {
        movePiece(from, to);
    }
}

function movePiece(from, to, promotion) {
    const move = chess.move({ from, to, promotion });

    if (move === null) {
        // Illegal move
        flashSquare(document.querySelector(`[data-square="${from}"]`));
        return;
    }

    updateBoard();
    clearSelectionAndIndicators();

    // Check for game over conditions
    if (chess.game_over()) {
        setTimeout(() => {
            alert(getGameOverText());
        }, 200);
    }
}

function showLegalMoveIndicators(moves) {
    moves.forEach(move => {
        const squareElement = document.querySelector(`[data-square="${move}"]`);
        if (squareElement) {
            const indicator = document.createElement('div');
            indicator.classList.add('legal-move-indicator');
            
            if (chess.get(move)) { // It's a capture
                indicator.classList.add('capture-indicator');
            }
            
            squareElement.appendChild(indicator);
            squareElement.classList.add('legal-move');
            legalMoveIndicators.push(indicator);
        }
    });
}

function clearSelectionAndIndicators() {
    if (selectedSquare) {
        const el = document.querySelector('.selected');
        if (el) el.classList.remove('selected');
        selectedSquare = null;
    }
    
    legalMoveIndicators.forEach(indicator => indicator.remove());
    legalMoveIndicators = [];
    
    document.querySelectorAll('.legal-move').forEach(square => {
        square.classList.remove('legal-move');
    });
}

function flashSquare(square) {
    if (!square) return;
    square.classList.add('flash-error');
    setTimeout(() => {
        square.classList.remove('flash-error');
    }, 600);
}

// --- Drag & Drop Handlers ---

function handleDragStart(e) {
    const pieceSquare = e.target.dataset.square;
    const piece = chess.get(pieceSquare);

    if (!piece || piece.color !== chess.turn()) {
        e.preventDefault();
        return;
    }

    dragSrcEl = e.target;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', pieceSquare);

    // Make piece transparent
    const pieceElement = e.target.querySelector('.piece');
    if (pieceElement) {
        pieceElement.style.opacity = '0.5';
    }

    // Show legal moves
    clearSelectionAndIndicators();
    selectedSquare = pieceSquare;
    const legalMoves = getLegalMoves(pieceSquare);
    showLegalMoveIndicators(legalMoves);
}

function handleDragEnd(e) {
    const pieceElement = e.target.querySelector('.piece');
    if (pieceElement) {
        pieceElement.style.opacity = '1';
    }
    // Clear indicators after a short delay
    setTimeout(clearSelectionAndIndicators, 100);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain');
    let toSquareEl = e.target;

    if (toSquareEl.classList.contains('piece')) {
        toSquareEl = toSquareEl.parentElement;
    }
    
    if (!toSquareEl.classList.contains('legal-move')) {
        return;
    }
    
    const toSquare = toSquareEl.dataset.square;
    attemptMove(fromSquare, toSquare);
}

function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    if (indicator) {
        const turn = chess.turn() === 'w' ? 'White' : 'Black';
        indicator.textContent = `Current turn: ${turn}`;
        indicator.style.color = turn === 'White' ? '#2c3e50' : '#34495e';
    }
}

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

document.addEventListener('DOMContentLoaded', function() {
    const introOverlay = document.getElementById('intro-overlay');
    const gameWrapper = document.getElementById('game-wrapper');
    const mainTitle = document.querySelector('h1.hidden');
    const whiteButton = document.getElementById('play-white');
    const blackButton = document.getElementById('play-black');

    function startGame(orientation) {
        playerOrientation = orientation;
        introOverlay.classList.add('hidden');
        gameWrapper.classList.remove('hidden');
        if(mainTitle) mainTitle.classList.remove('hidden');
        createBoard();
    }

    whiteButton.addEventListener('click', () => startGame('white'));
    blackButton.addEventListener('click', () => startGame('black'));
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#chessboard')) {
            clearSelectionAndIndicators();
        }
    });
});
