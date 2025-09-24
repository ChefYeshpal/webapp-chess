// Create a stockfish engine as a webworker
const stockfish = new Worker('stockfish.min.js');

// Flag to track if stockfish is ready
let stockfishReady = false;

// Listen for stockfish messages
stockfish.onmessage = function(event) {
    if (event.data === 'uciok') {
        stockfishReady = true;
    }
};

// Send initial UCI command to start the engine
stockfish.postMessage('uci');

// Function to get stockfish best move for a given FEN position
function fetchStockfishMove(fen, callback) {
    if (!stockfishReady) {
        console.warn("Stockfish is not ready yet!")
        return;
    }
    stockfish.postMessage('position fen ' + fen);
    // Can adjust depth for a slower/faster engine
    stockfish.postMessage('go depth 15'); 

    stockfish.onmessage = function(event) {
        const line = event.data;
        // Listen for best move response
        if (line.startsWith('bestmove')) {
            const move = line.split(' ')[1];
            callback(move);
        }
    };
}