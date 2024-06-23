const { Router } = require("express");
const router = Router();
const {
    handleGenerateGame,
    handleGameValidation,
} = require("../controllers/gameController");
const liveGames = require("../liveGames");

router.post("/generate-game", handleGenerateGame(liveGames));
router.post("/game-validation/:gameId", handleGameValidation(liveGames));

module.exports = router;
