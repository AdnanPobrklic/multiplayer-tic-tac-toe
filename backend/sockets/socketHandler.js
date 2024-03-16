const {checkForEndGame} = require("../utils/utils")

const handleJoinRoom = (socket, io, liveGames) => {
    socket.on("joinRoom", data => {

        socket.join(data.gameId)

        liveGames.forEach(game => {
            if(game.id == data.gameId){

                if(!game.player1.id){
                    game.player1.id = data.playerId
                    game.onTurn = data.playerId
                    game.playedFirst = data.playerId
                }else if(!game.player2.id && data.playerId != game.player1.id){
                    game.player2.id = data.playerId
                    io.to(game.id).emit("gameStart", {
                        turn: game.onTurn
                    })
                }
            }
        })
    })
};

const handleTileClicked = (socket, io, liveGames) => {
    socket.on("tileClicked", data => {

        liveGames.forEach(game => {

            if(game.id == data.gameId){
                if(!game.ongoing) return
                if(game.onTurn == data.playerId){
                    const clickedTileI = parseInt(data.tileClicked.substring(0, 1));
                    const clickedTileJ = parseInt(data.tileClicked.substring(2));
                    game.gameTiles[clickedTileI][clickedTileJ] = game.onTurn == game.player1.id ? game.player1.symbol : game.player2.symbol
                    io.to(game.id).emit("playedMove", {
                        tileClicked: data.tileClicked,
                        symbol: game.onTurn == game.player1.id ? game.player1.symbol : game.player2.symbol,
                        turn: game.onTurn
                    })
                    const gameHasWinner = checkForEndGame(game.gameTiles, game)
                    if(gameHasWinner){
                        game.ongoing = false
                        io.to(game.id).emit("gameOver", {
                            winner: gameHasWinner.winner,
                            highlithTiles: gameHasWinner.tiles
                        })
                    }
                    game.onTurn = game.onTurn == game.player1.id ? game.player2.id : game.player1.id
                    game.lastActivity = Date.now();
                }
            }
        })

    })
};

const handleRestartGameSocket = (socket, io, liveGames) => {
    socket.on("restartGame", data => {

        liveGames.forEach(game => {

            if(game.id == data.gameId){

                io.to(game.id).emit("rematchRequested", {
                    playerId: data.playerId
                })

                if(game.player1.id == data.playerId){
                    game.player1.wantsRematch = true;
                }

                if(game.player2.id == data.playerId) {
                    game.player2.wantsRematch = true;
                }

                if(game.player1.wantsRematch && game.player2.wantsRematch){
                    game.player1.wantsRematch = false;
                    game.player1.wantsRematch = false;
                    game.ongoing = true,
                    game.player1.symbol = game.player1.symbol == "X" ? "O" : "X",
                    game.player2.symbol = game.player2.symbol == "X" ? "O" : "X",
                    game.onTurn = game.playedFirst == game.player1.id ? game.player2.id : game.player1.id
                    game.playedFirst = game.playedFirst == game.player1.id ? game.player2.id : game.player1.id
                    game.gameTiles = [
                        ["", "", ""],
                        ["", "", ""], 
                        ["", "", ""],
                    ]
                    io.to(game.id).emit("restartBoard", {
                        turn: game.onTurn
                    })
                }
            }

        })

    })
};

module.exports = { handleJoinRoom, handleTileClicked, handleRestartGameSocket };