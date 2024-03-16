const { v4: uuidv4 } = require('uuid');

const handleGenerateGame = (liveGames) => (req, res) => {

    try{
        const gameLink = uuidv4();

        liveGames.push({
            ongoing: true,
            id: gameLink,
            player1: {
                id: "",
                symbol: "X",
                wins: 0,
                wantsRematch: false
            },
            player2: {
                id: "",
                symbol: "O",
                wins: 0,
                wantsRematch: false
            },
            onTurn: "",
            gameTiles: [
                ["", "", ""],
                ["", "", ""], 
                ["", "", ""],
            ],
            playedFirst: "",
            lastActivity: Date.now(),
        })

        res.status(200).json({gameLink:gameLink});

    }catch(err){
        res.status(500).json({message: "Internal server error"})
    }
};

const handleGameValidation = (liveGames) => (req, res) => {
    const { gameId } = req.params;

    const game = liveGames.find(item => item.id === gameId);

    if(game){
        return res.json(game).status(200)
    }
    
    return res.sendStatus(404)
};


module.exports = { handleGenerateGame, handleGameValidation };
