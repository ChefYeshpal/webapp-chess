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

function createBoard() {
  boardElement.innerHTML = '';

  for (let rankIdx = 0; rankIdx < ranks.length; rankIdx++) {
    let rank = ranks[rankIdx];
    for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
      const square = document.createElement('div');
      square.classList.add('square');

      if ((rankIdx + fileIdx) % 2 === 0) {
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
        square.appendChild(rankLabel);
      }
      if (rank === 1) {
        const fileLabel = document.createElement('div');
        fileLabel.classList.add('file-label');
        fileLabel.textContent = files[fileIdx];
        square.appendChild(fileLabel);
      }

      // Add piece names if any at starting positions
      const piecesOnRank = pieceSetup[rank];
      if (piecesOnRank) {
        const pieceName = piecesOnRank[fileIdx];
        if (pieceName) {
          // To avoid overlap with labels, create piece text in a child span
          const pieceSpan = document.createElement('span');
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

// Drag & drop handlers unchanged
function handleDragStart(e) {
  dragSrcEl = e.target;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', e.target.textContent);
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
    // Clear previous piece
    dragSrcEl.textContent = '';
    dragSrcEl.draggable = false;
    dragSrcEl.removeEventListener('dragstart', handleDragStart);
    dragSrcEl.removeEventListener('dragend', handleDragEnd);

    // Add piece to target
    e.target.textContent = dragSrcEl.textContent;
    e.target.draggable = true;
    e.target.addEventListener('dragstart', handleDragStart);
    e.target.addEventListener('dragend', handleDragEnd);

    // To keep labels on target square intact:
    // But here dragging overwrites textContent; this basic demo can be improved later
  }
}

document.addEventListener('DOMContentLoaded', createBoard);
