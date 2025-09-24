// Simple chess engine worker - makes random but legal moves
// This is a temporary solution until we get Stockfish working properly

let chess; // Will hold a chess.js instance

// Import chess.js in the worker
try {
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js');
} catch (error) {
    console.error('Failed to load chess.js in worker:', error);
    self.postMessage('error: Failed to load chess library');
}

self.onmessage = function(e) {
    const command = e.data;
    
    if (command === 'uci') {
        self.postMessage('uciok');
    } else if (command.startsWith('position fen ')) {
        const fen = command.substring(13);
        chess = new Chess(fen);
    } else if (command.startsWith('go')) {
        // Generate a move (random for now, but could be improved)
        if (chess) {
            const moves = chess.moves({ verbose: true });
            if (moves.length > 0) {
                // For now, just pick a random move
                // You could implement a simple minimax algorithm here later
                const randomMove = moves[Math.floor(Math.random() * moves.length)];
                const moveString = randomMove.from + randomMove.to + (randomMove.promotion || '');
                self.postMessage('bestmove ' + moveString);
            }
        }
    }
};