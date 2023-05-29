import {Movie} from "../models/Movie";
import {useEffect, useState} from "react";
import {axiosInstance} from "../utils/firebase";
import Carousel from "../components/carousel/Carousel";
import {CarouselItem} from "./carousel/Carousel-Item";

interface SectionProps {
    title: string;
    path: string;
    token?: string;
}

function Section({ title, path, token}: React.PropsWithChildren<SectionProps>) {

    const [hide, setHide] = useState(true)
    const [movies, setMovies] = useState<Movie[]>([]);

    function fetchMovies() {
        if (token != null) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        axiosInstance.get(path)
            .then(response => {
                setMovies(response.data.content);
            })
            .catch(error => {
                console.log(error);
            });

    }

    // Fill the slider with all the movies in the "movies" array

    useEffect(() => {
        fetchMovies();
    }, []);



    return (


            <Carousel
                title={title}
                show={2}
                hide={hide}
                setHide={setHide}
            >
                {movies.map(movie => (
                    <CarouselItem movie={movie} key={movie.id} hide={hide} setHide={setHide}/>
                ))}
            </Carousel>



    );
}

export default Section;