import {Movie} from "@/app/models/Movie";


export default function RatingsSection({ movie }: { movie: Movie }) {

    function IMDbRating() {
        const imdb = movie.ratings.imdb;

        return (
            <div className="flex flex-row gap-2 bg-black rounded-lg p-2">
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
                            className="flex flex-row">
                            <p className={"text-sm font-bold text-white"}>{rottenTomatoes}%</p>
                        </div>
                    </div>
                }
                {rottenAudienceStatus &&
                    <div className="flex flex-row gap-2 p-1 items-center">
                        <img className="w-[24px] h-[25px] object-cover"
                             src={"/rotten_tomatoes/" + rottenAudienceStatus + ".png"}
                             alt={"Rotten Tomatoes Audience"}
                        ></img>
                        <div
                            className="flex flex-row">
                            <p className={"text-sm font-bold text-white"}>{rottenAudience}%</p>
                        </div>
                    </div>
                }
            </div>

        );
    }

    function MetacriticRating() {
        const metacritic = movie.ratings.metacritic;

        return (
            <div className="flex flex-row gap-2 p-1 items-center">
                <img className="w-[20px] h-[20px] object-cover"
                     src={"/metacritic.png"}
                     alt={"Metacritic"}
                ></img>
                <div
                    className="flex flex-row">
                    <p className={"text-sm font-bold text-white"}>{metacritic}</p>
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