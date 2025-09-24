// Should contain most of the app functionality, will need to see what I should use in different files

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
let selectedSquare = null; // Track selected piece for legal moves
let legalMoveIndicators = []; // Store legal move indicators

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
      square.addEventListener('click', handleSquareClick);

      boardElement.appendChild(square);
    }
  }
}

// Legal move calculation functions
function getLegalMoves(piece, fromSquare, isCheckValidation = false) {
  const moves = [];
  const [fromFile, fromRank] = parseSquare(fromSquare);
  const pieceType = piece.substring(1); // Remove color prefix
  const isWhite = piece.startsWith('w');
  
  switch (pieceType) {
    case 'Pawn':
      moves.push(...getPawnMoves(fromFile, fromRank, isWhite, isCheckValidation));
      break;
// ... existing code ...
function getPawnMoves(file, rank, isWhite, isCheckValidation = false) {
  const moves = [];
  const direction = isWhite ? 1 : -1;
  const startRank = isWhite ? 1 : 6;
  
  // Forward moves (not relevant for check validation from opponent)
  if (!isCheckValidation) {
    const oneStep = squareToString(file, rank + direction);
    if (isValidSquare(oneStep) && !getPieceAt(oneStep)) {
      moves.push(oneStep);
      
      // Double move from start position
      if (rank === startRank) {
        const twoStep = squareToString(file, rank + 2 * direction);
        if (isValidSquare(twoStep) && !getPieceAt(twoStep)) {
          moves.push(twoStep);
        }
      }
    }
  }
// ... existing code ...
function handleSquareClick(e) {
  e.stopPropagation();
  const clickedSquare = e.currentTarget;
  const pieceElement = clickedSquare.querySelector('.piece');
  
  // If there's already a selected piece
  if (selectedSquare) {
    // Check if clicking on a legal move square
    if (clickedSquare.classList.contains('legal-move')) {
      // Move piece to clicked square
      movePieceToSquare(selectedSquare, clickedSquare);
      return;
    }
// ... existing code ...
      if ((currentTurn === 'white' && isWhitePiece) || (currentTurn === 'black' && isBlackPiece)) {
        // Clear previous selection and select new piece
        clearLegalMoveIndicators();
        clearSelection();
        
        selectedSquare = clickedSquare;
        clickedSquare.classList.add('selected');
        
        const validMoves = getValidMoves(piece, clickedSquare.dataset.square);
        showLegalMoveIndicators(validMoves);
        return;
      }
    }
    
// ... existing code ...
    if ((currentTurn === 'white' && isWhitePiece) || (currentTurn === 'black' && isBlackPiece)) {
      selectedSquare = clickedSquare;
      clickedSquare.classList.add('selected');
      
      const validMoves = getValidMoves(piece, clickedSquare.dataset.square);
      showLegalMoveIndicators(validMoves);
    }
  }
}

function showLegalMoveIndicators(moves) {
// ... existing code ...
function movePieceToSquare(fromSquare, toSquare) {
  // Check if target square already has a piece
  const existingPiece = toSquare.querySelector('.piece');
  if (existingPiece) {
    existingPiece.remove();
// ... existing code ...
    toSquare.addEventListener('dragstart', handleDragStart);
    toSquare.addEventListener('dragend', handleDragEnd);
    
    // Switch turns
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    updateTurnIndicator();

    // Check for check
    if (isKingInCheck(currentTurn)) {
        const kingSquare = findKing(currentTurn);
        const kingSquareElement = document.querySelector(`[data-square="${kingSquare}"]`);
        flashSquare(kingSquareElement);
    }
    
    // Clear selection and indicators
    clearLegalMoveIndicators();
    clearSelection();
  }
}

// Drag & drop handlers
// ... existing code ...
  dragSrcEl = e.target;
  draggedPieceText = pieceText;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', pieceText);
  
  // Only make the piece transparent, not the square
  pieceElement.style.opacity = '0.5';
  
  // Show legal moves when dragging starts
  clearLegalMoveIndicators();
  clearSelection();
  selectedSquare = e.target;
  const validMoves = getValidMoves(pieceText, e.target.dataset.square);
  showLegalMoveIndicators(validMoves);
}

function handleDragEnd(e) {
// ... existing code ...
    targetSquare.addEventListener('dragstart', handleDragStart);
    targetSquare.addEventListener('dragend', handleDragEnd);
    
    // Switch turns
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    updateTurnIndicator();

    // Check for check
    if (isKingInCheck(currentTurn)) {
        const kingSquare = findKing(currentTurn);
        const kingSquareElement = document.querySelector(`[data-square="${kingSquare}"]`);
        flashSquare(kingSquareElement);
    }
  }
}

function updateTurnIndicator() {
// ... existing code ...

function parseSquare(square) {
  const file = square.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
  const rank = parseInt(square.charAt(1)) - 1; // 1-based to 0-based
  return [file, rank];
}

function squareToString(file, rank) {
  return String.fromCharCode(97 + file) + (rank + 1);
}

function isValidSquare(square) {
  const [file, rank] = parseSquare(square);
  return file >= 0 && file < 8 && rank >= 0 && rank < 8;
}

function getPieceAt(square) {
  const squareElement = document.querySelector(`[data-square="${square}"]`);
  const pieceElement = squareElement?.querySelector('.piece');
  return pieceElement?.textContent || null;
}

function getPawnMoves(file, rank, isWhite) {
  const moves = [];
  const direction = isWhite ? 1 : -1;
  const startRank = isWhite ? 1 : 6;
  
  // Forward moves
  const oneStep = squareToString(file, rank + direction);
  if (isValidSquare(oneStep) && !getPieceAt(oneStep)) {
    moves.push(oneStep);
    
    // Double move from start position
    if (rank === startRank) {
      const twoStep = squareToString(file, rank + 2 * direction);
      if (isValidSquare(twoStep) && !getPieceAt(twoStep)) {
        moves.push(twoStep);
      }
    }
  }
  
  // Diagonal captures
  for (const captureFile of [file - 1, file + 1]) {
    const captureSquare = squareToString(captureFile, rank + direction);
    if (isValidSquare(captureSquare)) {
      const targetPiece = getPieceAt(captureSquare);
      if (targetPiece && targetPiece.startsWith(isWhite ? 'b' : 'w')) {
        moves.push(captureSquare);
      }
    }
  }
  
  return moves;
}

function getRookMoves(file, rank) {
  const moves = [];
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const currentPiece = getPieceAt(squareToString(file, rank));
  const isWhitePiece = currentPiece && currentPiece.startsWith('w');
  
  for (const [dx, dy] of directions) {
    for (let i = 1; i < 8; i++) {
      const newFile = file + dx * i;
      const newRank = rank + dy * i;
      const square = squareToString(newFile, newRank);
      
      if (!isValidSquare(square)) break;
      
      const piece = getPieceAt(square);
      if (!piece) {
        moves.push(square);
      } else {
        // Can capture opponent piece, but not own piece
        if (piece.startsWith(isWhitePiece ? 'b' : 'w')) {
          moves.push(square);
        }
        break;
      }
    }
  }
  
  return moves;
}

function getKnightMoves(file, rank) {
  const moves = [];
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  const currentPiece = getPieceAt(squareToString(file, rank));
  const isWhitePiece = currentPiece && currentPiece.startsWith('w');
  
  for (const [dx, dy] of knightMoves) {
    const square = squareToString(file + dx, rank + dy);
    if (isValidSquare(square)) {
      const piece = getPieceAt(square);
      // Can move to empty squares or capture opponent pieces
      if (!piece || piece.startsWith(isWhitePiece ? 'b' : 'w')) {
        moves.push(square);
      }
    }
  }
  
  return moves;
}

function getBishopMoves(file, rank) {
  const moves = [];
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  const currentPiece = getPieceAt(squareToString(file, rank));
  const isWhitePiece = currentPiece && currentPiece.startsWith('w');
  
  for (const [dx, dy] of directions) {
    for (let i = 1; i < 8; i++) {
      const newFile = file + dx * i;
      const newRank = rank + dy * i;
      const square = squareToString(newFile, newRank);
      
      if (!isValidSquare(square)) break;
      
      const piece = getPieceAt(square);
      if (!piece) {
        moves.push(square);
      } else {
        // Can capture opponent piece, but not own piece
        if (piece.startsWith(isWhitePiece ? 'b' : 'w')) {
          moves.push(square);
        }
        break;
      }
    }
  }
  
  return moves;
}

function getQueenMoves(file, rank) {
  return [...getRookMoves(file, rank), ...getBishopMoves(file, rank)];
}

function getKingMoves(file, rank) {
  const moves = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  const currentPiece = getPieceAt(squareToString(file, rank));
  const isWhitePiece = currentPiece && currentPiece.startsWith('w');
  
  for (const [dx, dy] of directions) {
    const square = squareToString(file + dx, rank + dy);
    if (isValidSquare(square)) {
      const piece = getPieceAt(square);
      // Can move to empty squares or capture opponent pieces
      if (!piece || piece.startsWith(isWhitePiece ? 'b' : 'w')) {
        moves.push(square);
      }
    }
  }
  
  return moves;
}

function handleSquareClick(e) {
  e.stopPropagation();
  const clickedSquare = e.currentTarget;
  const pieceElement = clickedSquare.querySelector('.piece');
  
  // If there's already a selected piece
  if (selectedSquare) {
    // Check if clicking on a legal move square
    if (clickedSquare.classList.contains('legal-move')) {
      // Move piece to clicked square
      movePieceToSquare(selectedSquare, clickedSquare);
      return;
    }
    // Check if clicking on the same piece (deselect)
    else if (clickedSquare === selectedSquare) {
      clearLegalMoveIndicators();
      clearSelection();
      return;
    }
    // Check if clicking on another piece of the same color (reselect)
    else if (pieceElement) {
      const piece = pieceElement.textContent;
      const isWhitePiece = piece.startsWith('w');
      const isBlackPiece = piece.startsWith('b');
      
      if ((currentTurn === 'white' && isWhitePiece) || (currentTurn === 'black' && isBlackPiece)) {
        // Clear previous selection and select new piece
        clearLegalMoveIndicators();
        clearSelection();
        
        selectedSquare = clickedSquare;
        clickedSquare.classList.add('selected');
        
        const legalMoves = getLegalMoves(piece, clickedSquare.dataset.square);
        showLegalMoveIndicators(legalMoves);
        return;
      }
    }
    
    // If we get here, it's an illegal move - flash the selected piece
    flashSquare(selectedSquare);
    return;
  }
  
  // No piece currently selected, try to select one
  if (pieceElement) {
    const piece = pieceElement.textContent;
    const isWhitePiece = piece.startsWith('w');
    const isBlackPiece = piece.startsWith('b');
    
    // Check if it's the correct player's turn
    if ((currentTurn === 'white' && isWhitePiece) || (currentTurn === 'black' && isBlackPiece)) {
      selectedSquare = clickedSquare;
      clickedSquare.classList.add('selected');
      
      const legalMoves = getLegalMoves(piece, clickedSquare.dataset.square);
      showLegalMoveIndicators(legalMoves);
    }
  }
}

function showLegalMoveIndicators(moves) {
  moves.forEach(move => {
    const squareElement = document.querySelector(`[data-square="${move}"]`);
    if (squareElement) {
      const piece = getPieceAt(move);
      const selectedPiece = selectedSquare.querySelector('.piece').textContent;
      const canCapture = piece && piece.startsWith(selectedPiece.startsWith('w') ? 'b' : 'w');
      
      const indicator = document.createElement('div');
      indicator.classList.add('legal-move-indicator');
      if (canCapture) {
        indicator.classList.add('capture-indicator');
      }
      squareElement.appendChild(indicator);
      squareElement.classList.add('legal-move');
      legalMoveIndicators.push(indicator);
    }
  });
}

function clearLegalMoveIndicators() {
  legalMoveIndicators.forEach(indicator => {
    indicator.remove();
  });
  legalMoveIndicators = [];
  
  document.querySelectorAll('.legal-move').forEach(square => {
    square.classList.remove('legal-move');
  });
}

function clearSelection() {
  if (selectedSquare) {
    selectedSquare.classList.remove('selected');
    selectedSquare = null;
  }
}

function flashSquare(square) {
  square.classList.add('flash-error');
  setTimeout(() => {
    square.classList.remove('flash-error');
  }, 600); // Flash for 600ms
}

function movePieceToSquare(fromSquare, toSquare) {
  // Check if target square already has a piece
  const existingPiece = toSquare.querySelector('.piece');
  if (existingPiece) {
    existingPiece.remove();
  }
  
  // Move piece from source to target
  const sourcePiece = fromSquare.querySelector('.piece');
  if (sourcePiece) {
    const pieceText = sourcePiece.textContent;
    sourcePiece.remove();
    
    // Remove draggable from source
    fromSquare.draggable = false;
    fromSquare.removeEventListener('dragstart', handleDragStart);
    fromSquare.removeEventListener('dragend', handleDragEnd);
    
    // Add piece to target square
    const newPieceSpan = document.createElement('span');
    newPieceSpan.classList.add('piece');
    newPieceSpan.textContent = pieceText;
    toSquare.appendChild(newPieceSpan);
    
    // Make target square draggable
    toSquare.draggable = true;
    toSquare.addEventListener('dragstart', handleDragStart);
    toSquare.addEventListener('dragend', handleDragEnd);
    
    // Switch turns
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    updateTurnIndicator();
    
    // Clear selection and indicators
    clearLegalMoveIndicators();
    clearSelection();
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
  
  // Only make the piece transparent, not the square
  pieceElement.style.opacity = '0.5';
  
  // Show legal moves when dragging starts
  clearLegalMoveIndicators();
  clearSelection();
  selectedSquare = e.target;
  const legalMoves = getLegalMoves(pieceText, e.target.dataset.square);
  showLegalMoveIndicators(legalMoves);
}

function handleDragEnd(e) {
  const pieceElement = e.target.querySelector('.piece');
  if (pieceElement) {
    pieceElement.style.opacity = '1';
  }
  
  // Clear legal move indicators after drag ends
  setTimeout(() => {
    clearLegalMoveIndicators();
    clearSelection();
  }, 100);
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
    
    // Only allow drops on legal move squares
    if (!targetSquare.classList.contains('legal-move')) {
      return;
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
  const indicator = document.getElementById('turn-indicator');
  if (indicator) {
    indicator.textContent = `Current turn: ${currentTurn === 'white' ? 'White' : 'Black'}`;
    indicator.style.color = currentTurn === 'white' ? '#2c3e50' : '#34495e';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  createBoard();
  updateTurnIndicator();
  
  // Clear selection when clicking outside the board
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#chessboard')) {
      clearLegalMoveIndicators();
      clearSelection();
    }
  });
});
