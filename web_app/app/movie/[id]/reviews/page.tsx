import Movie from "@/app/movie/[id]/Movie";
import  Reviews from "@/app/movie/[id]/reviews/Reviews";

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    return (
        <div className={"flex flex-col items-center justify-center p-4"}>
            <Reviews id={id} />
        </div>
    )
}

