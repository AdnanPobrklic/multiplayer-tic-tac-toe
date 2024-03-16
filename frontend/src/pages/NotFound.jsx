import { Link } from "react-router-dom";

export default function Home(){
    return (
        <main className="bg-stone-900 h-dvh text-slate-300 flex items-center justify-center flex-col gap-5 text-xl">
            <i className="fa-solid fa-ban text-4xl text-red-500"></i>
            <h1>Sorry this page does not exist</h1>
            <Link to="/" className="underline hover:opacity-50">Return to home</Link>
        </main>
    )
}