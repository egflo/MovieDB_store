"use client";

import Carousel from "@/app/components/Carousel";
import PosterCarousel from "@/app/components/PosterCarousel";

const MOVIES = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/all`;

export default function HomePage() {
    return (
        // -mt-14 pulls the hero up under the nav bar (h-14), which is clear at
        // the top of this page; see CLEAR_AT_TOP in NavBar.
        <main className="-mt-14 flex min-h-screen flex-col justify-start">
            <Carousel />
            <PosterCarousel title="Most Rated" url={`${MOVIES}?sortBy=ratings.numOfVotes`} seeAllHref="/search?sort=votes" />
            <PosterCarousel title="Popular" url={`${MOVIES}?sortBy=popularity`} seeAllHref="/search?sort=popular" />
            <PosterCarousel title="Box Office" url={`${MOVIES}?sortBy=revenue`} seeAllHref="/search?sort=boxOffice" />
        </main>
    );
}
