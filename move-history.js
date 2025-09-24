function updateMoveHistory(move) {
    const moveList = document.getElementById('move-list');
    const moveNumber = move.turn === 'w' ? `${Math.ceil(chess.history().length / 2)}. ` : '';

    if (move.turn === 'w') {

        // start a new row for white to move
        const movePair = document.createElement('div');
        movePair.classList.add('move-pair');
        movePair.innerHTML = `
            <span class="move-number">${moveNumber}</span>
            <span class="move-white">${move.san}</span>
            <span class="move-black></span>
            `;
            moveList.appendChild(movePair);
    } else {
        // add black's move to the last row
        const lastMovePair = moveList.lastElementChild;
        if (lastMovePair) {
            lastMovePair.querySelector('.move-black').textContent = move.san;
        }
    }

    // Auto-scroll for the lastest move
    moveList.scrollTop =  moveList.scrollHeight;
}