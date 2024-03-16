import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import io from "socket.io-client"
import { parse, v4 as uuidv1 } from 'uuid';
import ClockLoader from "react-spinners/ClockLoader";
import ScaleLoader from "react-spinners/ScaleLoader";

let socket;

export default function MultiplayerBoard(){

    const [validGame, setValidGame] = useState(true)
    const [playerId,  setPlayerId] = useState()
    const [turn,  setTurn] = useState(null)
    const [gameWinner, setGameWinner] = useState(null)
    const [score, setScore] = useState({me: 0, friend: 0})
    const [allPlayersJoined, setAllPlayersJoined] = useState(false)
    const [requestedRematch, setRequestedRematch] = useState(false)
    const [incommingRematchRequest, setIncommingRematchRequest] = useState(false)
    const [gameTerminated, setGameTerminated] = useState("")
    const [highlithTiles, setHighlithTiles] = useState([])

    const [board, setBoard] = useState([
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
    ]);

    useEffect(() => {
        if (window.location.href.includes("live-game")) socket = io.connect(import.meta.env.VITE_BACKEND_DOMAIN);

        if (socket) {
            const storedPlayerId = localStorage.getItem("playerId");
            const generatedId = storedPlayerId || uuidv1();

            setPlayerId(generatedId);
            localStorage.setItem("playerId", generatedId);

            const gameId = getGameId();
            socket.emit("joinRoom", { playerId: generatedId, gameId });
        }

        return () => {
            if (socket) {
            socket.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        const gameId = getGameId();
    
        fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/game-validation/${gameId}`, {
            method: "POST"
        })
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                throw new Error("Game not found");
            }
        })
        .then(data => {
            if(data.player2.id) setAllPlayersJoined(true)
            if(data.player2.id) setBoard(previousBoard => data.gameTiles)
    })
    .catch(error => {
            setValidGame(false); 
            console.error("Error:", error);
        });
    }, []);
    
    

    const handleTileClick = e => {
        if(gameTerminated || e.target.textContent != "") return
        socket.emit("tileClicked", {
            tileClicked: e.target.getAttribute("data-index"),
            playerId,
            gameId: getGameId(),
        })
    }

    const handleGameRestart = () => {
        if(gameTerminated) return
        socket.emit("restartGame", {
            gameId: getGameId(),
            playerId
        })
        setRequestedRematch(true)
    }

    useEffect(() => {
        if (socket) {
            socket.off("restartBoard");
    
            socket.on("restartBoard", data => {
                setRequestedRematch(false)
                setIncommingRematchRequest(false)
                setGameWinner(null);
                setBoard(previousBoard => [
                    ['', '', ''],
                    ['', '', ''],
                    ['', '', ''],
                ]);
                const turnCondition = data.turn == playerId ? "turn -> you" : "turn -> friend"
                setTurn(previousTurn => turnCondition)
                setHighlithTiles([])
                document.querySelectorAll(".tile").forEach(tile => {
                    tile.classList.add("bg-stone-900")
                    tile.classList.add("md:hover:bg-stone-800")
                    tile.classList.remove("bg-lime-600")
                    tile.classList.remove("bg-red-600")
                    tile.classList.remove("bg-yellow-600")
                })
            });
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.off("rematchRequested");
    
            socket.on("rematchRequested", data => {
                if(data.playerId != playerId) setIncommingRematchRequest(true)
            });
        }
    }, [socket]);
    
    useEffect(() => {
        if (socket) {
            socket.off("gameStart");
    
            socket.on("gameStart", data => {
                const turnCondition = data.turn == playerId ? "turn -> you" : "turn -> friend"
                setTurn(previousTurn => turnCondition)
                setAllPlayersJoined(true)
            });
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.off("gameTerminated");
    
            socket.on("gameTerminated", data => {
                setGameTerminated(data.msg)
            });
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {

            socket.off("playedMove");

            socket.on("playedMove", data => {
                const tileClickedI = parseInt(data.tileClicked.substring(0, 1))
                const tileClickedJ = parseInt(data.tileClicked.substring(2))
                setBoard(prevBoard => {
                    let tempBoard = [...prevBoard]
                    tempBoard[tileClickedI][tileClickedJ] = data.symbol
                    return tempBoard
                })
                const turnCondition = data.turn != playerId ? "turn -> you" : "turn -> friend"
                setTurn(previousTurn => turnCondition)
            });
            
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {

            socket.off("gameOver");

            socket.on("gameOver", data => {
                
                setGameWinner(previousWinner => data.winner)
                if(data.highlithTiles){
                    if(data.winner == playerId){
                        for(let i = 0; i < 6; i+=2){
                            document.querySelector(`div[data-index="${data.highlithTiles[i]}-${data.highlithTiles[i+1]}"]`).classList.remove("bg-stone-900")
                            document.querySelector(`div[data-index="${data.highlithTiles[i]}-${data.highlithTiles[i+1]}"]`).classList.remove("md:hover:bg-stone-800")
                            document.querySelector(`div[data-index="${data.highlithTiles[i]}-${data.highlithTiles[i+1]}"]`).classList.add("bg-lime-600")
                        }
                    }else{
                        for(let i = 0; i < 6; i+=2){
                            document.querySelector(`div[data-index="${data.highlithTiles[i]}-${data.highlithTiles[i+1]}"]`).classList.remove("bg-stone-900")
                            document.querySelector(`div[data-index="${data.highlithTiles[i]}-${data.highlithTiles[i+1]}"]`).classList.remove("md:hover:bg-stone-800")
                            document.querySelector(`div[data-index="${data.highlithTiles[i]}-${data.highlithTiles[i+1]}"]`).classList.add("bg-red-600")
                        }
                    }
                }else{
                    document.querySelectorAll(".tile").forEach(tile => {
                        tile.classList.remove("bg-stone-900")
                        tile.classList.remove("md:hover:bg-stone-800")
                        tile.classList.add("bg-yellow-600")
                    })
                }

                if(data.winner != "d"){
                    if(data.winner == playerId){
                        setScore(previousScore => ({
                            ...previousScore,
                            me: previousScore.me + 1
                        }))
                    }else{
                        setScore(previousScore => ({
                            ...previousScore,
                            friend: previousScore.friend + 1
                        }))
                    }
                }
            });
        }
    }, [socket]);

    const getGameId = () => {
        const pathArray = window.location.pathname.split('/');
        const gameId = pathArray[pathArray.length - 1];
        return gameId
    }

    return (
        <>
            {gameTerminated && 
                <p className="w-full text-center p-2 h-dvh bg-stone-900 text-slate-100 flex flex-col items-center justify-center gap-5 text-2xl select-none">
                    Game terminated ({gameTerminated})
                    <Link to="/" className="text-blue-500 underline">Home</Link>
                </p>
            }

            {!validGame && !gameTerminated && 
                <p className="w-full text-center p-2 h-dvh bg-stone-900 text-slate-100 flex flex-col items-center justify-center gap-5 text-2xl">
                    <i className="fa-solid fa-ban text-red-500 text-5xl"></i>
                    Invalid or expired game link, please generate a new one !
                    <Link to="/" className="underline md:hover:opacity-50">Return to home</Link>
                </p>
            }

            {!allPlayersJoined && !gameTerminated && validGame && 
                <p className="w-full text-center p-2 h-dvh bg-stone-900 text-slate-100 flex flex-col items-center justify-center gap-5 text-2xl">
                    Waiting for all players to join
                    <ClockLoader color="#36d7b7" />
                </p>
            }

            { requestedRematch && !gameTerminated && !incommingRematchRequest &&
                <p className="absolute top-32 right-1/2 text-stone-400 translate-x-1/2 flex gap-2 justify-center items-center text-center md:text-xl text-l w-4/5 ">
                    waiting for your friend to press rematch 
                    <ScaleLoader color="#36d7b7" />
                </p>
            }

            { !requestedRematch && !gameTerminated && incommingRematchRequest &&

                <p className="absolute top-32 right-1/2 text-stone-400 translate-x-1/2 flex gap-2 justify-center items-center text-center md:text-xl text-l w-4/5 "> 
                    your friend offered you a rematch ! 
                </p>
            }

            {validGame && !gameTerminated && allPlayersJoined && 
                <div className="bg-stone-900 text-slate-100 h-dvh flex justify-center items-center">

                    {
                    !gameWinner ? 
                    <p className="absolute top-8 md:text-3xl text-2xl select-none">{turn}</p> 
                    : 
                    gameWinner == playerId ?
                    <p className="absolute top-8 md:text-5xl text-3xl text-lime-600 select-none font-semibold font-mono">You won !</p>
                    :
                    gameWinner == "d" ?
                    <p className="absolute top-8 md:text-5xl text-3xl text-red-600 select-none font-semibold font-mono">Draw</p>
                    :
                    <p className="absolute top-8 md:text-5xl text-3xl text-yellow-600 select-none font-semibold font-mono">You lost !</p>
                    }

                    {
                        gameWinner && 
                        <p onClick={handleGameRestart} className="absolute top-20 md:text-4xl text-3xl select-none font-semibold font-mono md:hover:opacity-50 md:hover:cursor-pointer md:hover:text-lime-500">
                            <i className="fa-solid fa-rotate-right p-2"></i>
                        </p> 
                    }

                    <div className="absolute bottom-5 flex gap-1 select-none">
                        <p className="flex flex-col text-black  bg-stone-100 rounded text-xl md:w-20 w-16 py-2 text-center">
                            <b>me</b> 
                            <b>{score.me}</b>
                        </p>
                        <p className="flex flex-col text-black  bg-stone-100 rounded text-xl md:w-20 w-16 py-2 text-center">
                            <b>friend</b> 
                            <b>{score.friend}</b>
                        </p>
                    </div>

                    <div className="w-5/6 md:w-3/4 lg:w-1/2 h-1/2 grid grid-rows-3 grid-cols-3">
                        <div data-index="0-0" onClick={handleTileClick} 
                            className="bg-stone-900 tile transition-all  select-none w-full h-full flex justify-center items-center text-7xl 2xl:text-8xl cursor-pointer md:hover:bg-stone-800">
                                {board[0][0]}
                        </div>
                        <div data-index="0-1" onClick={handleTileClick} 
                            className="bg-stone-900 tile transition-all select-none border-x w-full h-full flex justify-center items-center text-7xl 2xl:text-8xl cursor-pointer md:hover:bg-stone-800">
                                {board[0][1]}
                        </div>
                        <div data-index="0-2" onClick={handleTileClick} 
                            className="bg-stone-900 tile transition-all select-none w-full h-full flex justify-center items-center text-7xl 2xl:text-8xl cursor-pointer md:hover:bg-stone-800">
                                {board[0][2]}
                        </div>
                        <div data-index="1-0" onClick={handleTileClick} 
                            className="bg-stone-900 tile transition-all border-y select-none w-full h-full flex justify-center items-center text-7xl 2xl:text-8xl cursor-pointer md:hover:bg-stone-800">
                                {board[1][0]}
                        </div>
                        <div data-index="1-1" onClick={handleTileClick} 
                            className="bg-stone-900 tile transition-all border-y select-none border-x w-full h-full flex justify-center items-center text-7xl 2xl:text-8xl cursor-pointer md:hover:bg-stone-800">
                                {board[1][1]}
                        </div>
                        <div data-index="1-2" onClick={handleTileClick} 
                            className="bg-stone-900 tile transition-all select-none border-y w-full h-full flex justify-center items-center text-7xl 2xl:text-8xl cursor-pointer md:hover:bg-stone-800">
                                {board[1][2]}
                        </div>
                        <div data-index="2-0" onClick={handleTileClick} 
                            className="bg-stone-900 tile transition-all select-none w-full h-full flex justify-center items-center text-7xl 2xl:text-8xl cursor-pointer md:hover:bg-stone-800">
                                {board[2][0]}
                        </div>
                        <div data-index="2-1" onClick={handleTileClick} 
                            className="bg-stone-900 tile transition-all select-none border-x w-full h-full flex justify-center items-center text-7xl 2xl:text-8xl cursor-pointer md:hover:bg-stone-800">
                                {board[2][1]}
                        </div>
                        <div data-index="2-2" onClick={handleTileClick} 
                            className="bg-stone-900 tile select-none w-full h-full flex justify-center items-center text-7xl 2xl:text-8xl cursor-pointer md:hover:bg-stone-800">
                                {board[2][2]}
                        </div>
                    </div>
                </div>
            }
        </>
    )
}