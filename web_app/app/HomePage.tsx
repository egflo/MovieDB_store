"use client";

import Carousel from "@/app/components/Carousel";
import PosterCarousel from "@/app/components/PosterCarousel";

const MOVIES = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/all`;

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col justify-start">
            <Carousel />
            <PosterCarousel title="Most Rated" url={`${MOVIES}?sortBy=ratings.numOfVotes`} />
            <PosterCarousel title="Popular" url={`${MOVIES}?sortBy=popularity`} />
            <PosterCarousel title="Box Office" url={`${MOVIES}?sortBy=revenue`} />
        </main>
    );
}
