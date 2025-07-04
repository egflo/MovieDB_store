"use client";

import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase/firebase";
import {useAuth} from "@/lib/firebase/AuthContext";
import Carousel from "@/app/components/Carousel";


const API_URL_BOOKMARK: string = `/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/bookmarks/?sortBy=created&limit=27`;
const API_URL_VOTES: string = `/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/all?sortBy=ratings.numOfVotes&limit=27`;
const API_URL_POPULAR: string = `/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/all?sortBy=popularity&limit=27`;
const API_URL_BOXOFFICE: string = `/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/all?sortBy=revenue&limit=27`;

export default function HomePage() {
    const router = useRouter();
    return (
        <main className="flex min-h-screen flex-col  justify-start ">
            <Carousel url={API_URL_VOTES} />
        </main>
    );
}