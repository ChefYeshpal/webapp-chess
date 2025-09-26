/**
 * Move History UI Component
 * 
 * Manages the display and interaction with chess move history.
 * Shows moves in standard algebraic notation (SAN) using chess.js library.
 * Features include:
 * - Visual move list with move numbers
 * - Dropdown menu with history actions
 * - Clear history functionality with confirmation
 * - CSV export functionality
 * - Move highlighting and navigation
 */

class MoveHistoryUI {
    /**
     * Initialize the Move History UI component
     * Sets up DOM references and event listeners
     */
    constructor() {
        /** @type {HTMLElement} Container for the move list */
        this.moveList = document.getElementById('move-list');
        
        /** @type {HTMLElement} Menu button (three dots) for history actions */
        this.menuButton = document.getElementById('clear-history');
        
        /** @type {HTMLElement} Dropdown menu container */
        this.dropdownMenu = null;
        
        /** @type {number} Index of currently highlighted move (-1 = none) */
        this.currentMoveIndex = -1;
        
        this.setupMenuButton();
        this.setupEventListeners();
    }

    /**
     * Sets up the menu button appearance and dropdown
     */
    setupMenuButton() {
        if (this.menuButton) {
            // Change button text to three dots
            this.menuButton.textContent = '⋯';
            this.menuButton.style.fontSize = '18px';
            this.menuButton.style.fontWeight = 'bold';
            this.menuButton.title = 'History options';
            
            // Create dropdown menu
            this.createDropdownMenu();
        }
    }

    /**
     * Creates the dropdown menu with delete and export options
     */
    createDropdownMenu() {
        this.dropdownMenu = document.createElement('div');
        this.dropdownMenu.className = 'history-dropdown-menu';
        this.dropdownMenu.style.cssText = `
            position: absolute;
            background: #2c3e50;
            border: 1px solid #34495e;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            z-index: 1000;
            min-width: 140px;
            display: none;
        `;

        // Create delete option
        const deleteOption = document.createElement('div');
        deleteOption.className = 'dropdown-option';
        deleteOption.textContent = '🗑️ Delete History';
        deleteOption.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #34495e;
            font-size: 14px;
            color: #ecf0f1;
        `;
        deleteOption.addEventListener('click', () => {
            this.hideDropdown();
            this.confirmClearHistory();
        });
        deleteOption.addEventListener('mouseenter', () => {
            deleteOption.style.backgroundColor = '#34495e';
        });
        deleteOption.addEventListener('mouseleave', () => {
            deleteOption.style.backgroundColor = 'transparent';
        });

        // Create export option
        const exportOption = document.createElement('div');
        exportOption.className = 'dropdown-option';
        exportOption.textContent = '📄 Export CSV';
        exportOption.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            font-size: 14px;
            color: #ecf0f1;
        `;
        exportOption.addEventListener('click', () => {
            this.hideDropdown();
            this.exportHistoryCSV();
        });
        exportOption.addEventListener('mouseenter', () => {
            exportOption.style.backgroundColor = '#34495e';
        });
        exportOption.addEventListener('mouseleave', () => {
            exportOption.style.backgroundColor = 'transparent';
        });

        this.dropdownMenu.appendChild(deleteOption);
        this.dropdownMenu.appendChild(exportOption);
        
        // Add to the page (position relative to button)
        document.body.appendChild(this.dropdownMenu);
    }

    /**
     * Sets up event listeners for UI interactions
     */
    setupEventListeners() {
        if (this.menuButton) {
            this.menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        // Close dropdown when clicking elsewhere
        document.addEventListener('click', () => {
            this.hideDropdown();
        });

        // Prevent dropdown from closing when clicking inside it
        if (this.dropdownMenu) {
            this.dropdownMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    /**
     * Toggles the dropdown menu visibility
     */
    toggleDropdown() {
        if (this.dropdownMenu.style.display === 'none' || !this.dropdownMenu.style.display) {
            this.showDropdown();
        } else {
            this.hideDropdown();
        }
    }

    /**
     * Shows the dropdown menu positioned relative to the menu button
     */
    showDropdown() {
        if (!this.dropdownMenu || !this.menuButton) return;

        const buttonRect = this.menuButton.getBoundingClientRect();
        this.dropdownMenu.style.display = 'block';
        this.dropdownMenu.style.top = (buttonRect.bottom + 2) + 'px';
        this.dropdownMenu.style.left = (buttonRect.right - this.dropdownMenu.offsetWidth) + 'px';
    }

    /**
     * Hides the dropdown menu
     */
    hideDropdown() {
        if (this.dropdownMenu) {
            this.dropdownMenu.style.display = 'none';
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
     * Exports the move history as a CSV file
     * Creates a downloadable file with move data in CSV format
     */
    exportHistoryCSV() {
        const moveCount = this.getMoveCount();
        
        if (moveCount === 0) {
            alert('No moves to export!');
            return;
        }

        // Get move history from chess.js
        const history = chess.history({ verbose: true });
        
        // Create CSV content
        let csvContent = 'Move Number,Color,Move,Piece,From,To,Captured,Check,Checkmate\n';
        
        history.forEach((move, index) => {
            const moveNumber = Math.ceil((index + 1) / 2);
            const color = move.color === 'w' ? 'White' : 'Black';
            const isCheck = move.san.includes('+') ? 'Yes' : 'No';
            const isCheckmate = move.san.includes('#') ? 'Yes' : 'No';
            const captured = move.captured ? move.captured.toUpperCase() : '';
            
            csvContent += `${moveNumber},${color},"${move.san}",${move.piece.toUpperCase()},${move.from.toUpperCase()},${move.to.toUpperCase()},${captured},${isCheck},${isCheckmate}\n`;
        });

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `chess-game-${timestamp}.csv`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`Exported ${moveCount} moves to ${filename}`);
        } else {
            // Fallback for browsers that don't support download attribute
            alert('Export not supported in this browser. Please copy the CSV data from the console.');
            console.log('CSV Data:\n' + csvContent);
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