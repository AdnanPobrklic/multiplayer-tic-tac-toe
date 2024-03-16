import { useEffect } from "react";
import { useState } from "react";

export default function SingleplayerBoard(){

    const [game, setGame] = useState({
        board: [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ],
        winner: null,
        onTurn: "p",
        firstMove: "p",
        onGoing: true,
        winningTiles: []
    });
    
    const [player, setPlayer] = useState({
        symbol: "X",
        wins: 0,
    });
    
    const [robot, setRobot] = useState({
        symbol: "O",
        wins: 0,
    });

    const restartGame = () => {

        document.querySelectorAll(".tile").forEach(tile => {
            if(tile.classList.contains("bg-red-600") || tile.classList.contains("bg-lime-600") || tile.classList.contains("bg-yellow-600")){
                tile.classList.add("bg-stone-900")
                tile.classList.add("md:hover:bg-stone-800")
                tile.classList.remove("bg-red-600")
                tile.classList.remove("bg-lime-600")
                tile.classList.remove("bg-yellow-600")
            }
        })

        setGame((prevGame) => ({
            winner: null,
            firstMove: prevGame.firstMove === 'p' ? 'r' : 'p',
            onTurn: prevGame.firstMove === 'p' ? 'r' : 'p',
            onGoing: true,
            winningTiles: [],
            board: [
                ['', '', ''],
                ['', '', ''],
                ['', '', ''],
            ]
        }));
    };
    
    const handleTileClick = e => {
        if (game.onTurn === "p" && game.onGoing) {
            const tileI = parseInt(e.target.getAttribute("data-index").substring(0, 1));
            const tileJ = parseInt(e.target.getAttribute("data-index").substring(2));
            if(game.board[tileI][tileJ]) return
            updateBoard(tileI, tileJ, player.symbol);
            setGame(previousGame => ({ ...previousGame, onTurn: "r" }));
        }
    };
    
    useEffect(() => {
        let timeoutId;
        if (game.onTurn === "r" && game.onGoing) {
            timeoutId = setTimeout(() => {
                let randomI = Math.floor(Math.random() * 3);
                let randomJ = Math.floor(Math.random() * 3);
        
                while (true) {
                    randomI = Math.floor(Math.random() * 3);
                    randomJ = Math.floor(Math.random() * 3);
                    if (game.board[randomI][randomJ] === "") break;
                }
        
                updateBoard(randomI, randomJ, robot.symbol);
                setGame(previousGame => ({ ...previousGame, onTurn: "p" }));
            }, 1000)
        }
    
        return () => clearTimeout(timeoutId); 
    }, [game.onTurn, game.firstMove, game.onGoing]);

    useEffect(() => {

        if(game.winner){

            setPlayer(prevPlayer => ({
                ...prevPlayer,
                symbol: prevPlayer.symbol == "X" ? "O" : "X"
            }))
            
            setRobot(prevRobot => ({
                ...prevRobot,
                symbol: prevRobot.symbol == "X" ? "O" : "X"
            }))

            if(game.winner === "p"){
                for(let i = 0; i < 6; i += 2){
                    document.querySelector(`div[data-index="${game.winningTiles[i]}-${game.winningTiles[i+1]}"]`).classList.remove("bg-stone-900")
                    document.querySelector(`div[data-index="${game.winningTiles[i]}-${game.winningTiles[i+1]}"]`).classList.add("bg-lime-600")
                    document.querySelector(`div[data-index="${game.winningTiles[i]}-${game.winningTiles[i+1]}"]`).classList.remove("md:hover:bg-stone-800")
                }
                setPlayer(prevPlayer => ({
                    ...prevPlayer,
                    wins: prevPlayer.wins + 1
                }))
            }else if(game.winner === "r"){
                for(let i = 0; i < 6; i += 2){
                    document.querySelector(`div[data-index="${game.winningTiles[i]}-${game.winningTiles[i+1]}"]`).classList.remove("bg-stone-900")
                    document.querySelector(`div[data-index="${game.winningTiles[i]}-${game.winningTiles[i+1]}"]`).classList.add("bg-red-600")
                    document.querySelector(`div[data-index="${game.winningTiles[i]}-${game.winningTiles[i+1]}"]`).classList.remove("md:hover:bg-stone-800")
                }
                setRobot(prevRobot => ({
                    ...prevRobot,
                    wins: prevRobot.wins + 1
                }))
            }else if(game.winner === "d"){
                document.querySelectorAll(".tile").forEach(tile => {
                    tile.classList.remove("bg-stone-900")
                    tile.classList.add("bg-yellow-600")
                    tile.classList.remove("md:hover:bg-stone-800")
                })
            }
        }
    }, [game.winner])

    useEffect(() => {
        checkForEndGame();
    }, [game.board])
    
    const updateBoard = (i, j, sym) => {
        const tempBoard = [...game.board];
        tempBoard[i][j] = sym;
        setGame(prevGame => ({...prevGame, board: tempBoard}))
    };

    const checkForEndGame = () => {
        let winner = null;
        let winningTiles

        for(let i = 0; i < 3; i++){
            if(game.board[i][0] === game.board[i][1] && game.board[i][0] === game.board[i][2] && game.board[i][0] !== ''){
                winningTiles = [i, 0, i, 1, i, 2]
                winner = game.board[i][0] == player.symbol ? "p" : "r";
                break;
            }
            
            if(game.board[0][i] === game.board[1][i] && game.board[0][i] === game.board[2][i] && game.board[0][i] !== ''){
                winningTiles = [0, i, 1, i, 2, i]
                winner = game.board[0][i] == player.symbol ? "p" : "r";
                break;
            }
        }
        
        if(winner === null && game.board[0][0] === game.board[1][1] && game.board[1][1] === game.board[2][2] && game.board[0][0] !== ''){
            winningTiles = [0, 0, 1, 1, 2, 2]
            winner = game.board[0][0] == player.symbol ? "p" : "r";
        }
        
        if(winner === null && game.board[0][2] === game.board[1][1] && game.board[0][2] === game.board[2][0] && game.board[0][2] !== ''){
            winningTiles = [0, 2, 1, 1, 2, 0]
            winner = game.board[0][2] == player.symbol ? "p" : "r";
        }
    
        let allFilled = true;
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                if(game.board[i][j] === ''){
                    allFilled = false;
                    break;
                }
            }
            if(!allFilled){
                break;
            }
        }
    
        if(allFilled && winner === null){
            winner = 'd';
        }
    
        if(winner !== null){
            setGame((prevGame) => ({
                ...prevGame, 
                winner: winner, 
                onGoing: false ,
                winningTiles: winningTiles
            }));
            return true;
        }
    
        return false;
    }

    return(
        <div className="bg-stone-900 text-slate-100 h-dvh flex justify-center items-center">

            {
                !game.winner ? 
                <p className="absolute top-12 md:text-4xl text-3xl select-none">turn <i className="fa-solid fa-arrow-right md:text-3xl text-2xl"></i> <span>{game.onTurn == "p" ? <i className="fa-solid fa-user text-slate-500"></i> : <i className="fa-solid fa-robot text-red-500"></i>}</span></p> 
                : 
                game.winner == "p" ?
                <p className="absolute top-12 md:text-5xl text-4xl text-lime-600 select-none font-semibold font-mono">You won !</p>
                :
                game.winner == "r" ?
                <p className="absolute top-12 md:text-5xl text-4xl text-red-600 select-none font-semibold font-mono">You lost !</p>
                :
                <p className="absolute top-12 md:text-5xl text-4xl text-yellow-600 select-none font-semibold font-mono">Draw</p>
            }

            {
                game.winner && 
                    <p onClick={restartGame} className="absolute top-28 md:text-5xl text-4xl select-none font-semibold font-mono md:hover:opacity-50 md:hover:cursor-pointer md:hover:text-lime-500">
                        <i className="fa-solid fa-rotate-right"></i>
                    </p> 
            }

            <div className="absolute bottom-5 flex gap-1 select-none">
                <p className="flex flex-col text-black  bg-stone-100 rounded text-2xl md:w-20 w-16 py-2 text-center">
                    <span><i className="fa-solid fa-user"></i></span> 
                    <b>{player.wins}</b>
                </p>
                <p className="flex flex-col text-black  bg-stone-100 rounded text-2xl md:w-20 w-16 py-2 text-center">
                    <span><i className="fa-solid fa-robot"></i></span> 
                    <b>{robot.wins}</b>
                </p>
            </div>

            <div className="w-5/6 md:w-3/4 lg:w-1/2 h-1/2 grid grid-rows-3 grid-cols-3">
                {game.board.map((row, i) => (
                row.map((symbol, j) => (
                    <div
                    key={`${i}-${j}`}
                    data-index={`${i}-${j}`}
                    onClick={handleTileClick}
                    className={`tile transition-all select-none w-full h-full flex justify-center items-center text-7xl 2xl:text-8xl cursor-pointer bg-stone-900 md:hover:bg-stone-800 ${i == 1 ? "border-y-2" : null} ${j == 1 ? "border-x-2" : null}`}
                    >
                    {symbol}
                    </div>
                ))
                ))}
            </div>
        </div>
    )
}