import IconButton from "@mui/material/IconButton";

import React, {useEffect, useRef} from "react";
import Card from "@mui/material/Card";
import {Backdrop, CardHeader} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {ShareOutlined} from "@mui/icons-material";

type ShareProps = {
    id: string;
}
export default function Share(props: ShareProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = React.useState(false);

    const handleShare = () => {
        setSelected(!selected);
    }

    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        // @ts-ignore
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setSelected(false);
            }
        }

        // Bind the event listener
        // @ts-ignore
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            // @ts-ignore
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);


    return (
        <>
                <Box className="bg-gray-900 hover:bg-gray-800 rounded-full">
                    <IconButton
                        onClick={handleShare}
                        aria-label="share"
                        color={selected ? "primary" : "inherit"}
                    >

                        <ShareOutlined/>
                    </IconButton>
                </Box>


                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={selected}
                >
                            <Card ref={ref} >
                                <div className={"flex flex-col gap-4 p-4 isolate aspect-video  rounded-xl bg-gray-400/20 shadow-lg ring-1 ring-black/5 "}>
                                    <div className="flex justify-between items-center gap-4 mb-4  rounded-lg p-4">
                                        <div className="share-button">
                                            <img
                                                src="https://img.icons8.com/color/48/000000/facebook-new.png"
                                                alt="Facebook"
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Facebook
                                            </Typography>
                                        </div>

                                        <div className="share-button">
                                            <img
                                                src="https://img.icons8.com/color/48/000000/instagram-new.png"
                                                alt="Instagram"
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Instagram
                                            </Typography>
                                        </div>
                                        <div className="share-button">
                                            <img
                                                src="https://img.icons8.com/color/48/000000/twitter.png"
                                                alt="Twitter"
                                            />
                                            <Typography variant="body2" color="text.primary">
                                                Twitter
                                            </Typography>
                                        </div>
                                        <div className="share-button">
                                            <img
                                                src="https://img.icons8.com/color/48/000000/email.png"
                                                alt="Email"
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Email
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="border-2 bg-gray-500 rounded-lg p-2 ">
                                        https://moviedb.com/movie/</div>
                                        <button className="bg-gray-800 text-white rounded-lg px-4 py-2">
                                            Copy Link
                                        </button>
                                    </div>
                                </div>
                            </Card>
                </Backdrop>

        </>

    )
}