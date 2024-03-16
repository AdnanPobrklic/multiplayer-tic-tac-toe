const checkForEndGame = (board, game) => {
    let winner = null;
    
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === board[i][1] && board[i][0] === board[i][2] && board[i][0] !== '') {
            return { winner: board[i][0] === game.player1.symbol ? game.player1.id : game.player2.id, tiles: [i, 0, i, 1, i, 2]};
        }

        if (board[0][i] === board[1][i] && board[0][i] === board[2][i] && board[0][i] !== '') {
            return { winner: board[0][i] === game.player1.symbol ? game.player1.id : game.player2.id, tiles: [0, i, 1, i, 2, i]};
        }
    }

    if (winner === null && board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== '') {
        return { winner: board[0][0] === game.player1.symbol ? game.player1.id : game.player2.id, tiles: [0, 0, 1, 1, 2, 2]};
    }

    if (winner === null && board[0][2] === board[1][1] && board[0][2] === board[2][0] && board[0][2] !== '') {
        return { winner: board[0][2] === game.player1.symbol ? game.player1.id : game.player2.id, tiles: [0, 2, 1, 1, 2, 0]};
    }

    let allFilled = true;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === '') {
                allFilled = false;
                break;
            }
        }
        if (!allFilled) {
            break;
        }
    }

    if (allFilled && winner === null) {
        return { winner: "d"};
    }

    return false;
};

const cleanupInactiveGames = (io, liveGames) => {
    const now = Date.now();
    const inactiveThreshold =  1 * 60 * 1000; 

    liveGames.forEach((game, index) => {
        if (now - game.lastActivity > inactiveThreshold) {
            liveGames.splice(index, 1);
            io.to(game.id).emit("gameTerminated", {
                msg: "due to inactivity"
            })
        }
    });
    
};

module.exports = { checkForEndGame, cleanupInactiveGames };