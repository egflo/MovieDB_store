import Movie from "@/app/movie/[id]/Movie";
import Review from "@/app/movie/[id]/reviews/review/Review";

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    return (
        <div className={"flex flex-col items-center justify-center p-4"}>
            <Review />
        </div>
    )
}

