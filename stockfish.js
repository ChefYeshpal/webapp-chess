/**
 * Chess Engine Interface
 * 
 * Manages communication with the chess engine web worker.
 * Handles UCI protocol communication and provides a simple API for getting moves.
 * 
 * The engine worker implements a basic random move generator as a placeholder
 * for a more sophisticated chess engine like Stockfish.
 */

/** @type {Worker} Web worker instance running the chess engine */
const stockfish = new Worker('./stockfish-worker.js');

/** @type {boolean} Flag to track if the chess engine is initialized and ready */
let stockfishReady = false;

/**
 * Main message handler for engine responses
 * Processes UCI protocol messages from the worker
 * 
 * @param {MessageEvent} event - Message from the chess engine worker
 */
stockfish.onmessage = function(event) {
    const line = event.data;
    console.log('Engine says:', line);
    
    if (line === 'uciok') {
        stockfishReady = true;
        console.log('Chess engine is ready!');
    }
};

/**
 * Error handler for worker communication issues
 * Logs any errors that occur in the chess engine worker
 * 
 * @param {ErrorEvent} error - Error event from the worker
 */
stockfish.onerror = function(error) {
    console.error('Chess engine worker error:', error);
};

// Initialize the engine by sending the UCI command
stockfish.postMessage('uci');

/**
 * Requests the best move from the chess engine for a given position
 * 
 * @param {string} fen - FEN string representing the current board position
 * @param {function} callback - Callback function to receive the engine's move
 *                              Called with move string (e.g., 'e2e4') or null if no move
 */
function fetchStockfishMove(fen, callback) {
    if (!stockfishReady) {
        console.warn("Chess engine is not ready yet!");
        // Retry after a short delay if engine isn't initialized
        setTimeout(() => fetchStockfishMove(fen, callback), 100);
        return;
    }
    
    console.log('Requesting move for position:', fen);
    
    // Send position and calculation command to the engine
    stockfish.postMessage('position fen ' + fen);
    stockfish.postMessage('go depth 20'); // Request move calculation at a certain depth
    // More depth = better moves, as the engine think's farther ahead

    /**
     * Temporary message handler for this specific move request
     * Listens for the engine's response and calls the callback
     * 
     * @param {MessageEvent} event - Response from the chess engine
     */
    const handleMoveResponse = function(event) {
        const line = event.data;
        console.log('Engine response:', line);
        
        if (line.startsWith('bestmove')) {
            const move = line.split(' ')[1];
            console.log('Engine suggests move:', move);
            
            // Clean up: remove this temporary handler
            stockfish.removeEventListener('message', handleMoveResponse);
            
            // Return the move to the callback
            callback(move);
        }
    };
    
    // Attach the temporary handler for this move request
    stockfish.addEventListener('message', handleMoveResponse);
}