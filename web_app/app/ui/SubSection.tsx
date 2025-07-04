import {Movie} from "@/lib/models/Movie";


export default function SubSection({ movie }: { movie: Movie }) {

    function Runtime() {
        const runtime = movie.runtime;
        if (!runtime) {
            return <p className={"text-sm font-bold text-white"}>N/A</p>;
        }

        const minutes = runtime.split(" ")[0];
        const hours = Math.floor(parseInt(minutes) / 60);
        const remainingMinutes = parseInt(minutes) % 60;
        const formattedRuntime = `${hours}h ${remainingMinutes}m`;
        return formattedRuntime
    }

    function Rated() {
        const rated = movie.rated;

        switch (rated) {
            case "G":
                return <img className="w-[24px] h-[20px] object-cover" src={"/rated/G.svg"} alt={"Rated G"}></img>;
            case "PG":
                return <img className="w-[30px] h-[20px] object-cover" src={"/rated/PG.svg"} alt={"Rated PG"}></img>;
            case "PG-13":
                return <img className="w-[52px] h-[20px] object-cover bg-gray-900" src={"/rated/PG-13.svg"} alt={"Rated PG-13"}></img>;
            case "R":
                return <img className="w-[25px] h-[22px] object-cover" src={"/rated/R.svg"} alt={"Rated R"}></img>;
            default:
                return <span className={"text-sm font-bold text-white"}>N/A</span>;
        }
    }

    return (
        <div className={"flex flex-row gap-2 text-sm font-semibold shadow-2xl text-white"}>
            {movie.year && <div>{movie.year} &#x2022; </div>}
            {movie.rated && <div className={"flex flex-row gap-2"}><Rated /> &#x2022; </div>}
            {movie.runtime && <span>{Runtime()} </span>}
        </div>

    );
}