import { notFound } from 'next/navigation'
import Movie from "./Movie"
import {getTokens} from "next-firebase-auth-edge";
import {cookies} from "next/headers";
import {serverConfig} from "@/lib/firebase/config";

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;


    return (
        <Movie  id={id} />
    )
}

