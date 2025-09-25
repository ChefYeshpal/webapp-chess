class MoveHistoryUI {
    constructor() {
        this.moveList = document.getElementById('move-list');
        this.clearButton = document.getElementById('clear-history');
        this.currentMoveIndex = -1;
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.confirmClearHistory();
            });
        }
    }

    // Show confirmation dialog before clearing history
    confirmClearHistory() {
        const moveCount = this.getMoveCount();
        
        if (moveCount === 0) {
            // No moves to clear
            return;
        }

        const confirmMessage = `Are you sure you want to clear the move history?\n\nThis will permanently delete ${moveCount} move${moveCount === 1 ? '' : 's'} and cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            this.clearHistory();
        }
    }
    
    // Add move to history display using chess.js SAN notation
    addMove(move, moveNumber) {
        const isWhite = chess.turn() === 'b'; // If black's turn now, then white just moved
        const algebraic = move.san; //chess.js provides standard algebraic notation

        if (isWhite) {
            // Start new pair for white moves
            const movePair = document.createElement('div');
            movePair.className = 'move-pair';
            movePair.dataset.moveNumber = Math.ceil(moveNumber / 2);

            const moveNumberSpan = document.createElement('span');
            moveNumberSpan.className = 'move-number';
            moveNumberSpan.textContent = `${Math.ceil(moveNumber / 2)}.`;

            const whiteMove = document.createElement('span');
            whiteMove.className = 'white-move';
            whiteMove.textContent = algebraic;
            whiteMove.dataset.moveIndex = moveNumber - 1;

            movePair.appendChild(moveNumberSpan);
            movePair.appendChild(whiteMove);

            this.moveList.appendChild(movePair);
        } else {
            // Add black move to existing pair
            const lastPair = this.moveList.lastElementChild;
            if (lastPair && lastPair.className === 'move-pair') {
                const blackMove = document.createElement('span');
                blackMove.className = 'black-move';
                blackMove.textContent = algebraic;
                blackMove.dataset.moveIndex = moveNumber - 1;
                
                lastPair.appendChild(blackMove);
            }
        }

        // Auto-scroll to bottom
        this.moveList.scrillTop = this.moveList.scrillHeight;
        this.currentMoveIndex = moveNumber -1;

    }

    // Highlight current move
    highlightMove(moveIndex) {
        // Remove previous highlight
        const highlighted = this.moveList.querySelector('.current-move');
        if (highlighted) {
            highlighted.classList.remove('current-move');
        }

        // Add new highlight
        const moveSpan = this.moveList.querySelector(`[data-move-index='${moveIndex}']`);
        if (moveSpan) {
            moveSpan.classList.add('current-move');
            // Ensure it's visible
            moveSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        this.currentMoveIndex = moveIndex;
    }

    // Clear all history
    clearHistory() {
        this.moveList.innerHTML = '';
        this.currentMoveIndex = -1;
    }

    // Get move cont
    getMoveCount() {
        return this.moveList.querySelectorAll('[data-move-index]').length;
    }
}

// Initialize move history UI when DOM is loaded
let moveHistoryUI;
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other elements are loaded
    setTimeout(() => {
        moveHistoryUI = new MoveHistoryUI();
    }, 100);
});

// Legacy function for backward compatibility
function updateMoveHistory(move) {
    if (moveHistoryUI) {
        const moveCount = chess.history().length;
        moveHistoryUI.addMove(move, moveCount);
    }
}