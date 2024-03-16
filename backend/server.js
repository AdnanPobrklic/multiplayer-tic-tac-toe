require("dotenv").config()
const express = require("express");
const http = require("http");
const app = express();
const { Server } = require("socket.io");
const cors = require("cors");
const { cleanupInactiveGames } = require("./utils/utils");
const { handleGenerateGame, handleGameValidation } = require("./controllers/gameController");
const { handleJoinRoom, handleTileClicked, handleRestartGameSocket } = require("./sockets/socketHandler");
const liveGames = require("./liveGames")

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_DOMAIN,
    },
});

server.listen(process.env.PORT, () => {
    console.log("Server running");
});

setInterval(() => {
    cleanupInactiveGames(io, liveGames)
}, 5 * 60 * 1000);

app.post("/generate-game", handleGenerateGame(liveGames));
app.post("/game-validation/:gameId", handleGameValidation(liveGames));

io.on("connection", (socket) => {
    handleJoinRoom(socket, io, liveGames);
    handleTileClicked(socket, io, liveGames);
    handleRestartGameSocket(socket, io, liveGames);
});