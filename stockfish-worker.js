/**
 * Simple Chess Engine Worker
 * 
 * A temporary chess engine implementation that makes random legal moves.
 * This is a placeholder solution until a proper Stockfish integration is implemented.
 * 
 * The worker implements basic UCI (Universal Chess Interface) protocol commands:
 * - 'uci': Initialize engine
 * - 'position fen [fen_string]': Set board position
 * - 'go': Calculate and return best move
 * 
 * Current algorithm: Random move selection from all legal moves
 * Future: Could be enhanced with minimax, alpha-beta pruning, or actual Stockfish
 */

/** @type {Chess} Chess.js instance for game logic and move generation */
let chess;

/**
 * Import chess.js library for move generation and validation
 * Uses CDN version to avoid local file dependencies in worker
 */
try {
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js');
} catch (error) {
    console.error('Failed to load chess.js in worker:', error);
    self.postMessage('error: Failed to load chess library');
}

/**
 * Main message handler for UCI protocol commands
 * Processes commands from the main thread and responds appropriately
 * 
 * @param {MessageEvent} e - Message event containing UCI command
 */
self.onmessage = function(e) {
    const command = e.data;
    
    if (command === 'uci') {
        // UCI initialization command - respond that engine is ready
        self.postMessage('uciok');
        
    } else if (command.startsWith('position fen ')) {
        // Set board position from FEN string
        const fen = command.substring(13);
        chess = new Chess(fen);
        
    } else if (command.startsWith('go')) {
        // Calculate and return the best move
        if (chess) {
            const moves = chess.moves({ verbose: true });
            if (moves.length > 0) {
                // Current implementation: Random move selection
                // TODO: Implement proper chess engine evaluation
                // Could add: minimax algorithm, position evaluation, opening book
                const randomMove = moves[Math.floor(Math.random() * moves.length)];
                
                // Format move in UCI notation (e.g., 'e2e4' or 'e7e8q' for promotion)
                const moveString = randomMove.from + randomMove.to + (randomMove.promotion || '');
                self.postMessage('bestmove ' + moveString);
            }
        }
    }
};