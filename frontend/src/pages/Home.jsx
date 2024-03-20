import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv1 } from 'uuid';
import ClipLoader from "react-spinners/PacmanLoader";

export default function Home(){

    const [gameLink, setGameLink] = useState("");
    const [fetchError, setFetchError] = useState(false);
    const [loading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                await new Promise(resolve => setTimeout(resolve, 1500)); 
                setIsLoading(false);
            } catch (error) {
                console.error("Error occurred during data fetching:", error);
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const generateGameLink = async () => {
        if (!document.querySelector(".game-link-div").classList.contains("hidden")) return;
        document.querySelector(".game-link-div").classList.remove("hidden");

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_DOMAIN}/generate-game`, {
                method: "POST",
            });

            if (res.status === 200) {
                setFetchError(false);
                const data = await res.json();
                setGameLink(data.gameLink);
            } else {
                throw new Error("Failed to generate game link. Status: " + res.status);
            }
        } catch (err) {
            console.error("Error generating game link:", err);
            setFetchError(true);
        }
    };

    const hideGameLinkDiv = () => {
        document.querySelector(".game-link-div").classList.add("hidden");
    };

    const copyLinkToClipboard = e => {
        e.target.classList.remove("fa-copy");
        e.target.classList.add("fa-check");
        setTimeout(() => {
            e.target.classList.add("fa-copy");
            e.target.classList.remove("fa-check");
        }, 500);
        const copyText = document.getElementById("game-link").innerText;
        navigator.clipboard.writeText(copyText);
    };

    return (
        isLoading ? 
            <main className="min-h-dvh w-full bg-neutral-950 flex justify-center items-center">
                <PacmanLoader color="#fdfdfd" />
            </main>
        :
            <main className="bg-slate-900 w-full min-h-dvh text-gray-300 flex flex-col items-center bg-[url('./assets/ttt-bg-3.png')] bg-center bg-cover bg-no-repeat text-center">
                <h1 className="text-6xl font-bold my-12 mb-36 text-black text-lime-400 select-none md:text-8xl">Tic-tac-toe</h1>
                <Link to="/single-player" className="md:w-96 w-72 text-center md:py-5 py-3 bg-stone-900 text-lime-400 md:hover:bg-slate-500 transition-all font-bold rounded-xl text-2xl mb-10 font-mono select-none">
                    Singleplayer
                </Link>
                <button onClick={generateGameLink} className="md:w-96 w-72 text-center md:py-5 py-3 bg-stone-900 text-lime-400 font-bold md:hover:bg-slate-500  transition-all rounded-xl text-2xl font-mono select-none cursor-pointer">
                    Multiplayer
                </button>

                <div className="fixed top-[20%] md:relative md:mt-5 mx-2 min-w[300px] bg-stone-900 p-7 rounded-xl text-lime-400 flex flex-col font-mono hidden game-link-div md:text-xl text-m gap-2">
                    <p className="absolute top-1 right-3 text-red-500 cursor-pointer md:hover:opacity-50 text-2xl text-bold select-none" onClick={hideGameLinkDiv}>X</p>
                    <b className="select-none">Game link:</b>
                    <span className="select-none">(to play paste this link into your browser and send it to your friend)</span>
                    <p className="flex gap-2 p-5 justify-center items-center border-t-2 border-lime-600">
                        {gameLink ? 
                            <>
                                <Link to={`${import.meta.env.VITE_FRONTEND_DOMAIN}/live-game/${gameLink}`} id="game-link" className="underline md:hover:opacity-50">{import.meta.env.VITE_FRONTEND_DOMAIN}/live-game/{gameLink}</Link> 
                                <i className="fa-solid fa-copy cursor-pointer md:hover:opacity-50 select-none" onClick={copyLinkToClipboard}></i>
                            </>
                            : (!fetchError ?
                                <span className="flex items-center gap-5 flex-col lg:flex-row">
                                    <p className="text-xs md:text-sm">Game is being created (sorry if this takes longer since we are using free hosting) </p>
                                    <ClipLoader color="#36d7b7" />
                                </span>
                                :
                                <span>Sorry server error encountered, your game could not be created please try again later</span>
                            )
                        }
                    </p>
                </div>
            </main>
    );
}
