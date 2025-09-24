
function findKing(kingColor) {
    const kingPiece = kingColor === 'white' ? 'wKing' : 'bKing';
    const squares = document.querySelectorAll('.square');
    for (const square of squares) {
        const piece = square.querySelector('.piece');
        if (piece && piece.textContent === kingPiece) {
            return square.dataset.square;
        }
    }
    return null;
}

function isSquareAttacked(square, attackerColor) {
    const opponentColor = attackerColor === 'white' ? 'black' : 'white';
    const allSquares = document.querySelectorAll('.square');

    for (const s of allSquares) {
        const pieceElement = s.querySelector('.piece');
        if (pieceElement) {
            const piece = pieceElement.textContent;
            if ((attackerColor === 'white' && piece.startsWith('w')) || (attackerColor === 'black' && piece.startsWith('b'))) {
                const moves = getLegalMoves(piece, s.dataset.square, true); // isCheckValidation = true
                if (moves.includes(square)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isKingInCheck(kingColor) {
    const kingSquare = findKing(kingColor);
    if (!kingSquare) {
        return false; 
    }
    const opponentColor = kingColor === 'white' ? 'black' : 'white';
    return isSquareAttacked(kingSquare, opponentColor);
}

function getValidMoves(piece, fromSquare) {
    const legalMoves = getLegalMoves(piece, fromSquare);
    const validMoves = [];
    const pieceColor = piece.startsWith('w') ? 'white' : 'black';

    for (const move of legalMoves) {
        const fromElement = document.querySelector(`[data-square="${fromSquare}"]`);
        const toElement = document.querySelector(`[data-square="${move}"]`);
        const fromPiece = fromElement.querySelector('.piece');
        const toPiece = toElement.querySelector('.piece');

        // Simulate move
        if (toPiece) toElement.removeChild(toPiece);
        toElement.appendChild(fromPiece);

        if (!isKingInCheck(pieceColor)) {
            validMoves.push(move);
        }

        // Revert move
        toElement.removeChild(fromPiece);
        fromElement.appendChild(fromPiece);
        if (toPiece) toElement.appendChild(toPiece);
    }
    return validMoves;
}
