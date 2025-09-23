const boardElement = document.getElementById('chessboard');

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

const pieceSetup = {
  1: ['wRook', 'wKnight', 'wBishop', 'wQueen', 'wKing', 'wBishop', 'wKnight', 'wRook'],
  2: ['wPawn','wPawn','wPawn','wPawn','wPawn','wPawn','wPawn','wPawn'],
  7: ['bPawn','bPawn','bPawn','bPawn','bPawn','bPawn','bPawn','bPawn'],
  8: ['bRook', 'bKnight', 'bBishop', 'bQueen', 'bKing', 'bBishop', 'bKnight', 'bRook']
};

let dragSrcEl = null;
let currentTurn = 'white'; // Track whose turn it is
let draggedPieceText = ''; // Store the piece text during drag

function createBoard() {
  boardElement.innerHTML = '';

  for (let rankIdx = 0; rankIdx < ranks.length; rankIdx++) {
    let rank = ranks[rankIdx];
    for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
      const square = document.createElement('div');
      square.classList.add('square');

      const isLightSquare = (rankIdx + fileIdx) % 2 === 0;
      if (isLightSquare) {
        square.classList.add('light');
      } else {
        square.classList.add('dark');
      }

      square.dataset.square = files[fileIdx] + rank;

      // Add coordinate markings on left edge (fileIdx == 0) and bottom edge (rank == 1)
      if (fileIdx === 0) {
        const rankLabel = document.createElement('div');
        rankLabel.classList.add('rank-label');
        rankLabel.textContent = rank;
        rankLabel.style.color = isLightSquare ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
        square.appendChild(rankLabel);
      }
      if (rank === 1) {
        const fileLabel = document.createElement('div');
        fileLabel.classList.add('file-label');
        fileLabel.textContent = files[fileIdx];
        fileLabel.style.color = isLightSquare ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
        square.appendChild(fileLabel);
      }

      // Add piece names if any at starting positions
      const piecesOnRank = pieceSetup[rank];
      if (piecesOnRank) {
        const pieceName = piecesOnRank[fileIdx];
        if (pieceName) {
          // To avoid overlap with labels, create piece text in a child span
          const pieceSpan = document.createElement('span');
          pieceSpan.classList.add('piece');
          pieceSpan.textContent = pieceName;
          square.appendChild(pieceSpan);

          square.draggable = true;
          square.addEventListener('dragstart', handleDragStart);
          square.addEventListener('dragend', handleDragEnd);
        }
      }

      square.addEventListener('dragover', handleDragOver);
      square.addEventListener('drop', handleDrop);

      boardElement.appendChild(square);
    }
  }
}

// Drag & drop handlers
function handleDragStart(e) {
  const pieceElement = e.target.querySelector('.piece');
  if (!pieceElement) return;
  
  const pieceText = pieceElement.textContent;
  const isWhitePiece = pieceText.startsWith('w');
  const isBlackPiece = pieceText.startsWith('b');
  
  // Check if it's the correct player's turn
  if ((currentTurn === 'white' && !isWhitePiece) || (currentTurn === 'black' && !isBlackPiece)) {
    e.preventDefault();
    return;
  }
  
  dragSrcEl = e.target;
  draggedPieceText = pieceText;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', pieceText);
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
    // Get the target square element
    let targetSquare = e.target;
    
    // If dropped on a piece, get the parent square
    if (e.target.classList.contains('piece')) {
      targetSquare = e.target.parentElement;
    }
    
    // Check if target square already has a piece
    const existingPiece = targetSquare.querySelector('.piece');
    if (existingPiece) {
      // Remove the captured piece
      existingPiece.remove();
    }
    
    // Remove piece from source square
    const sourcePiece = dragSrcEl.querySelector('.piece');
    if (sourcePiece) {
      sourcePiece.remove();
    }
    
    // Remove draggable from source
    dragSrcEl.draggable = false;
    dragSrcEl.removeEventListener('dragstart', handleDragStart);
    dragSrcEl.removeEventListener('dragend', handleDragEnd);
    
    // Add piece to target square
    const newPieceSpan = document.createElement('span');
    newPieceSpan.classList.add('piece');
    newPieceSpan.textContent = draggedPieceText;
    targetSquare.appendChild(newPieceSpan);
    
    // Make target square draggable
    targetSquare.draggable = true;
    targetSquare.addEventListener('dragstart', handleDragStart);
    targetSquare.addEventListener('dragend', handleDragEnd);
    
    // Switch turns
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    updateTurnIndicator();
  }
}

function updateTurnIndicator() {
  let indicator = document.getElementById('turn-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'turn-indicator';
    indicator.style.marginTop = '20px';
    indicator.style.fontSize = '18px';
    indicator.style.fontWeight = 'bold';
    document.body.appendChild(indicator);
  }
  indicator.textContent = `Current turn: ${currentTurn === 'white' ? 'White' : 'Black'}`;
  indicator.style.color = currentTurn === 'white' ? '#333' : '#666';
}

document.addEventListener('DOMContentLoaded', function() {
  createBoard();
  updateTurnIndicator();
});
