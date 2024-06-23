require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const gameRoutes = require("./routes/gameRoutes");
const { Server } = require("socket.io");
const { cleanupInactiveGames } = require("./utils/utils");
const {
    handleJoinRoom,
    handleTileClicked,
    handleRestartGameSocket,
} = require("./sockets/socketHandler");
const liveGames = require("./liveGames");

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
    cleanupInactiveGames(io, liveGames);
}, 5 * 60 * 1000);

io.on("connection", (socket) => {
    handleJoinRoom(socket, io, liveGames);
    handleTileClicked(socket, io, liveGames);
    handleRestartGameSocket(socket, io, liveGames);
});

app.use(cors());
app.use(express.json());
app.use("/", gameRoutes);
