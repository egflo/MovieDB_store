import {Movie} from "@/lib/models/Movie";


export default function RatingsSection({ movie }: { movie: Movie }) {

    function IMDbRating() {
        const imdb = movie.ratings.imdb;

        if (!imdb) {
            return (
                <div className="flex flex-row gap-2 bg-black rounded-lg p-2 items-center justify-center m-1">
                    <img className="w-[45px] h-[20px] object-cover"
                         src={"/imdb.png"}
                         alt={"IMDB"}
                    ></img>
                    <p className={"text-sm font-bold text-white"}>N/A</p>
                </div>
            )
        }

        return (
            <div className="flex flex-row gap-2 bg-black rounded-lg p-2 items-center justify-center m-1">
                <img className="w-[45px] h-[20px] object-cover"
                     src={"/imdb.png"}
                     alt={"IMDB"}
                ></img>
                <div
                    className="flex flex-row">
                            <p className={"text-sm font-bold text-white"}>{imdb}</p>
                            <span style={{
                            color: 'grey',
                            fontSize: '0.8rem',
                            margin: 0
                        }}> / 10 </span>
                </div>
            </div>

        );
    }

    function RottenTomatoesRating() {
        const rottenTomatoes = movie.ratings.rottenTomatoes;
        const rottenAudience = movie.ratings.rottenTomatoesAudience
        const rottenTomatoesStatus = movie.ratings.rottenTomatoesStatus;
        const rottenAudienceStatus = movie.ratings.rottenTomatoesAudienceStatus;

        return (
            <div className="flex flex-row gap-2">
                {rottenTomatoesStatus &&
                    <div className="flex flex-row gap-2 p-1 items-center">
                        <img className="w-[24px] h-[25px] object-cover"
                             src={"/rotten_tomatoes/" + rottenTomatoesStatus + ".png"}
                             alt={"Rotten Tomatoes"}
                        ></img>
                        <div
                            className="flex flex-col gap-0">
                            <p className={"text-sm font-bold text-white p-0"}>{rottenTomatoes}%</p>
                            <span className={"text-gray-300 text-xs"}>Fresh</span>
                        </div>
                    </div>
                }
                {rottenAudienceStatus &&
                    <div className="flex flex-row gap-2 p-1 items-center">
                        <img className="w-[24px] h-[25px] object-contain"
                             src={"/rotten_tomatoes/" + rottenAudienceStatus + ".png"}
                             alt={"Rotten Tomatoes Audience"}
                        ></img>
                        <div
                            className="flex flex-col gap-0">
                            <p className={"text-sm font-bold text-white"}>{rottenAudience}%</p>
                            <span className={"text-gray-300 text-xs"}>Audience</span>
                        </div>
                    </div>
                }
            </div>

        );
    }

    function MetacriticRating() {
        const metacritic = movie.ratings.metacritic;

        var color = "grey";
        if(metacritic) {
            if (metacritic >= 75) {
                color = "green";
            } else if (metacritic >= 50) {
                color = "yellow";
            } else if (metacritic >= 25) {
                color = "orange";
            } else {
                color = "red";
            }

            //const color =  metacritic >= 75 ? "green" : metacritic >= 50 ? "yellow" : metacritic >= 25 ? "orange" : "red";
        }

        return (
            <div className="flex flex-row gap-2 items-center">
                <img className="w-[25px] h-[25px] object-cover"
                     src={"/metacritic.png"}
                     alt={"Metacritic"}
                ></img>
                <div
                    className="flex flex-col">
                    <p className={"text-sm font-bold text-white"}>{metacritic}</p>
                    <div
                        className={`h-2 rounded-full  bg-${color}-500 w-full `}
                    ></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row gap-2">
            <IMDbRating />
            <RottenTomatoesRating />
            <MetacriticRating />
        </div>
    );
}