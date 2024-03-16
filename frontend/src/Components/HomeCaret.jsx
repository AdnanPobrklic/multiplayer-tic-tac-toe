import { Link } from "react-router-dom";

export default function HomeCaret(){
    return(
        < Link to="/" title="home"><i className="fa-solid fa-arrow-left fixed top-2 left-5 text-4xl text-lime-500 md:hover:opacity-50"></i></Link>
    )
}