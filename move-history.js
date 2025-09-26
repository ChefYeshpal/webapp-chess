/**
 * Move History UI Component
 * 
 * Manages the display and interaction with chess move history.
 * Shows moves in standard algebraic notation (SAN) using chess.js library.
 * Features include:
 * - Visual move list with move numbers
 * - Clear history functionality with confirmation
 * - Move highlighting and navigation
 * - Future: Move export functionality
 */

class MoveHistoryUI {
    /**
     * Initialize the Move History UI component
     * Sets up DOM references and event listeners
     */
    constructor() {
        /** @type {HTMLElement} Container for the move list */
        this.moveList = document.getElementById('move-list');
        
        /** @type {HTMLElement} Button to clear move history */
        this.clearButton = document.getElementById('clear-history');
        
        /** @type {number} Index of currently highlighted move (-1 = none) */
        this.currentMoveIndex = -1;
        
        this.setupEventListeners();
    }

    /**
     * Sets up event listeners for UI interactions
     */
    setupEventListeners() {
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.confirmClearHistory();
            });
        }
    }

    /**
     * Shows confirmation dialog before clearing move history
     * Prevents accidental deletion of game progress
     */
    confirmClearHistory() {
        const moveCount = this.getMoveCount();
        
        if (moveCount === 0) {
            // No moves to clear - exit silently
            return;
        }

        const confirmMessage = `Are you sure you want to clear the move history?\n\nThis will permanently delete ${moveCount} move${moveCount === 1 ? '' : 's'} and cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            this.clearHistory();
        }
    }
    
    /**
     * Adds a move to the history display using Standard Algebraic Notation (SAN)
     * @param {Object} move - Move object from chess.js containing move details
     * @param {number} moveNumber - Sequential move number in the game
     */
    addMove(move, moveNumber) {
        const isWhite = chess.turn() === 'b'; // If it's black's turn now, white just moved
        const algebraic = move.san; // chess.js provides standard algebraic notation

        if (isWhite) {
            // Create new move pair for white moves (starts each full move)
            const movePair = document.createElement('div');
            movePair.className = 'move-pair';
            movePair.dataset.moveNumber = Math.ceil(moveNumber / 2);

            // Create move number indicator (1., 2., 3., etc.)
            const moveNumberSpan = document.createElement('span');
            moveNumberSpan.className = 'move-number';
            moveNumberSpan.textContent = `${Math.ceil(moveNumber / 2)}.`;

            // Create white move span
            const whiteMove = document.createElement('span');
            whiteMove.className = 'white-move';
            whiteMove.textContent = algebraic;
            whiteMove.dataset.moveIndex = moveNumber - 1;

            movePair.appendChild(moveNumberSpan);
            movePair.appendChild(whiteMove);

            this.moveList.appendChild(movePair);
        } else {
            // Add black move to the existing pair
            const lastPair = this.moveList.lastElementChild;
            if (lastPair && lastPair.className === 'move-pair') {
                const blackMove = document.createElement('span');
                blackMove.className = 'black-move';
                blackMove.textContent = algebraic;
                blackMove.dataset.moveIndex = moveNumber - 1;
                
                lastPair.appendChild(blackMove);
            }
        }

        // Auto-scroll to show the latest move
        this.moveList.scrollTop = this.moveList.scrollHeight;
        this.currentMoveIndex = moveNumber - 1;
    }

    /**
     * Highlights a specific move in the history list
     * @param {number} moveIndex - Index of the move to highlight
     */
    highlightMove(moveIndex) {
        // Remove previous highlight
        const highlighted = this.moveList.querySelector('.current-move');
        if (highlighted) {
            highlighted.classList.remove('current-move');
        }

        // Add new highlight to the specified move
        const moveSpan = this.moveList.querySelector(`[data-move-index='${moveIndex}']`);
        if (moveSpan) {
            moveSpan.classList.add('current-move');
            // Ensure the highlighted move is visible in the scroll area
            moveSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        this.currentMoveIndex = moveIndex;
    }

    /**
     * Clears all move history from the display
     * Resets the move list to empty state
     */
    clearHistory() {
        this.moveList.innerHTML = '';
        this.currentMoveIndex = -1;
    }

    /**
     * Gets the total number of moves in the history
     * @returns {number} Total move count
     */
    getMoveCount() {
        return this.moveList.querySelectorAll('[data-move-index]').length;
    }
}

// === INITIALIZATION AND LEGACY SUPPORT ===

/** @type {MoveHistoryUI} Global instance of the move history UI */
let moveHistoryUI;

/**
 * Initialize move history UI when DOM is fully loaded
 * Uses a small delay to ensure all DOM elements are ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Brief delay to ensure other elements are loaded first
    setTimeout(() => {
        moveHistoryUI = new MoveHistoryUI();
    }, 100);
});

/**
 * Legacy function for backward compatibility with older code
 * @param {Object} move - Move object from chess.js
 * @deprecated Use moveHistoryUI.addMove() directly instead
 */
function updateMoveHistory(move) {
    if (moveHistoryUI) {
        const moveCount = chess.history().length;
        moveHistoryUI.addMove(move, moveCount);
    }
}