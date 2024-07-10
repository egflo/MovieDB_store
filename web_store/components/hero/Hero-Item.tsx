import React, {useState} from "react";
import {Movie} from "../../models/Movie";
import {axiosInstance} from "../../utils/firebase";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {Info} from "@mui/icons-material";
import {useRouter} from "next/router";


interface HeroItemProps {
    id: string;
}

export const HeroItem = (props: HeroItemProps) => {
    const {id} = props;
    const [mounted, setMounted] = useState<Movie | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        axiosInstance.get( `/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/${id}`)
            .then(response => {
                setMounted(response.data);
            })
    } , [])

    function handleClick(movieId: string) {
        router.push(`/movie/${movieId}`);

    }

    return (
        <>
            {mounted && (
                <Box className="h-full w-full ">
                    <img src={mounted.background} alt="Movie" draggable={false}
                            className="object-cover w-full h-full" />


                    <Box className="absolute bottom-0 w-full h-full bg-gradient-to-t from-black to-transparent" />


                    <Box className="absolute top-0 left-0 w-full h-full m-4 flex flex-col justify-content-center items-start sm:display-none">


                        <img
                            src={mounted.logo}
                            alt={mounted.title}
                            draggable={false}
                            className="object-contain w-[50%] h-[20%]  md:w-[25%] md:h-[25%]"
                        />

                        <Typography variant="inherit" className="text-white w-[35%] hidden md:block">
                            {mounted.plot}
                        </Typography>

                        <Button variant="contained" className="mt-2 bg-zinc-700 z-10" onClick={() => handleClick(mounted.id)}>
                            <Info className="mr-2" />
                            More Info
                        </Button>



                    </Box>


                </Box>
            )}
        </>

    );

}