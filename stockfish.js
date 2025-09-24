// Create a chess engine as a webworker
const stockfish = new Worker('./stockfish-worker.js');

// Flag to track if stockfish is ready
let stockfishReady = false;

// Listen for stockfish messages
stockfish.onmessage = function(event) {
    const line = event.data;
    console.log('Engine says:', line);
    
    if (line === 'uciok') {
        stockfishReady = true;
        console.log('Chess engine is ready!');
    }
};

// Handle worker errors
stockfish.onerror = function(error) {
    console.error('Chess engine worker error:', error);
};

// Send initial UCI command to start the engine
stockfish.postMessage('uci');

// Function to get chess engine best move for a given FEN position
function fetchStockfishMove(fen, callback) {
    if (!stockfishReady) {
        console.warn("Chess engine is not ready yet!");
        // Wait a bit and try again
        setTimeout(() => fetchStockfishMove(fen, callback), 100);
        return;
    }
    
    console.log('Requesting move for position:', fen);
    stockfish.postMessage('position fen ' + fen);
    stockfish.postMessage('go depth 5'); 

    // Set up a temporary message handler for this move request
    const handleMoveResponse = function(event) {
        const line = event.data;
        console.log('Engine response:', line);
        
        if (line.startsWith('bestmove')) {
            const move = line.split(' ')[1];
            console.log('Engine suggests move:', move);
            // Remove this handler and restore the original
            stockfish.removeEventListener('message', handleMoveResponse);
            callback(move);
        }
    };
    
    stockfish.addEventListener('message', handleMoveResponse);
}