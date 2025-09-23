const boardElement = document.getElementById('chessboard');

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

// Starting position pieces by rank (white at bottom, black at top)
const pieceSetup = {
  1: ['wRook', 'wKnight', 'wBishop', 'wQueen', 'wKing', 'wBishop', 'wKnight', 'wRook'],
  2: ['wPawn','wPawn','wPawn','wPawn','wPawn','wPawn','wPawn','wPawn'],
  7: ['bPawn','bPawn','bPawn','bPawn','bPawn','bPawn','bPawn','bPawn'],
  8: ['bRook', 'bKnight', 'bBishop', 'bQueen', 'bKing', 'bBishop', 'bKnight', 'bRook']
};

// Track dragged piece information
let dragSrcEl = null;

// Create board squares and pieces
function createBoard() {
  boardElement.innerHTML = ''; // Clear previous

  for (let rank of ranks) {
    for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
      const square = document.createElement('div');
      square.classList.add('square');

      // Color squares alternately
      if ((ranks.indexOf(rank) + fileIdx) % 2 === 0) {
        square.classList.add('light');
      } else {
        square.classList.add('dark');
      }

      square.dataset.square = files[fileIdx] + rank;

      // Add piece text if present
      const piecesOnRank = pieceSetup[rank];
      if (piecesOnRank) {
        const pieceName = piecesOnRank[fileIdx];
        if (pieceName) {
          square.textContent = pieceName;
          square.draggable = true;
          // Add drag event listeners
          square.addEventListener('dragstart', handleDragStart);
          square.addEventListener('dragend', handleDragEnd);
        }
      }

      // Add drag over and drop event listeners for movement
      square.addEventListener('dragover', handleDragOver);
      square.addEventListener('drop', handleDrop);

      boardElement.appendChild(square);
    }
  }
}

// Drag & drop handlers
function handleDragStart(e) {
  dragSrcEl = e.target;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', e.target.textContent);
  // Optional: visually highlight dragged piece
  e.target.style.opacity = '0.5';
}

function handleDragEnd(e) {
  e.target.style.opacity = '1';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
  e.preventDefault();
  if (dragSrcEl !== e.target && e.target.classList.contains('square')) {
    // Move piece visually
    e.target.textContent = dragSrcEl.textContent;
    dragSrcEl.textContent = '';
    dragSrcEl.draggable = false; // Clear previous draggable square
    e.target.draggable = true;    // New square with piece is draggable

    // Remove old listeners, add to new square
    dragSrcEl.removeEventListener('dragstart', handleDragStart);
    dragSrcEl.removeEventListener('dragend', handleDragEnd);
    e.target.addEventListener('dragstart', handleDragStart);
    e.target.addEventListener('dragend', handleDragEnd);
  }
}

// Initialize the board when page loads
document.addEventListener('DOMContentLoaded', createBoard);