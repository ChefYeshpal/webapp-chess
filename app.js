const boardElement = document.getElementById('chessboard');

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

// Starting position pieces by rank (white at bottom, black at top)
const pieceSetup = {
    1: ['wRook', 'wKnight', 'wBishop', 'wQueen', 'wKing', 'wBishop', 'wKnight', 'wRook'],
    2: ['wPawn', 'wPawn', 'wPawn', 'wPawn', 'wPawn', 'wPawn', 'wPawn', 'wPawn'],
    7: ['bPawn', 'bPawn', 'bPawn', 'bPawn', 'bPawn', 'bPawn', 'bPawn', 'bPawn'],
    8: ['bRook', 'bKnight', 'bBishop', 'bQueen', 'bKing', 'bBishop', 'bKnight', 'bRook']
};

// Track dragges piece information
let dragSrcE1 =  null;

// To create chess board squares and pieces
function createBoard() {
    boardElement.innerHTML = ''; // Clear existing board if any

    for (let rank of ranks) {
        for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
            const square = document.createElement('div');
            square.classList.add('square');

            // Colour squares alternately
            if ((ranks.indexOf(rank) + fileIdx) % 2 === 0) {
                square.classList.add('light');
            }
            else {
                square.classList.add('dark');
            }

            square.dataset.square =  files[fileIdx] + rank; // e.g., 'a1', 'b2', etc.

            // Add piece text if present
            const piecesOnRank = pieceSetup[rank];
            if (piecesOnRank) {
                
            }
        }
    }
}