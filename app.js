const boardElement = document.getElementById('chessboard');
const ranksColumn = document.getElementById('ranks-column');
const filesRow = document.getElementById('files-row');

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

const pieceSetup = {
  1: ['wRook', 'wKnight', 'wBishop', 'wQueen', 'wKing', 'wBishop', 'wKnight', 'wRook'],
  2: ['wPawn','wPawn','wPawn','wPawn','wPawn','wPawn','wPawn','wPawn'],
  7: ['bPawn','bPawn','bPawn','bPawn','bPawn','bPawn','bPawn','bPawn'],
  8: ['bRook', 'bKnight', 'bBishop', 'bQueen', 'bKing', 'bBishop', 'bKnight', 'bRook']
};

let dragSrcEl = null;

function createCoordinates() {
  ranksColumn.innerHTML = '';
  filesRow.innerHTML = '';

  for (let i = 0; i < 8; i++) {
    const rankLabel = document.createElement('div');
    rankLabel.textContent = ranks[i];
    rankLabel.style.height = '64px';
    rankLabel.style.lineHeight = '64px';
    rankLabel.style.textAlign = 'center';
    ranksColumn.appendChild(rankLabel);
  }

  for (let f of files) {
    const fileLabel = document.createElement('div');
    fileLabel.textContent = f;
    fileLabel.style.width = '64px';
    fileLabel.style.textAlign = 'center';
    filesRow.appendChild(fileLabel);
  }
}

function createBoard() {
  boardElement.innerHTML = '';

  for (let rank of ranks) {
    for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
      const square = document.createElement('div');
      square.classList.add('square');

      if ((ranks.indexOf(rank) + fileIdx) % 2 === 0) {
        square.classList.add('light');
      } else {
        square.classList.add('dark');
      }

      square.dataset.square = files[fileIdx] + rank;

      const piecesOnRank = pieceSetup[rank];
      if (piecesOnRank) {
        const pieceName = piecesOnRank[fileIdx];
        if (pieceName) {
          square.textContent = pieceName;
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
    e.target.textContent = dragSrcEl.textContent;
    dragSrcEl.textContent = '';
    dragSrcEl.draggable = false;
    e.target.draggable = true;

    dragSrcEl.removeEventListener('dragstart', handleDragStart);
    dragSrcEl.removeEventListener('dragend', handleDragEnd);
    e.target.addEventListener('dragstart', handleDragStart);
    e.target.addEventListener('dragend', handleDragEnd);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  createCoordinates();
  createBoard();
});
