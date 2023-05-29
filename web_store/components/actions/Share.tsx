import IconButton from "@mui/material/IconButton";

import React, {useEffect, useRef} from "react";
import Card from "@mui/material/Card";
import {Backdrop, CardHeader} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Movie} from "../../models/Movie";
import {ShareOutlined} from "@mui/icons-material";

type ShareProps = {
    movie: Movie;
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
                <Box className="container__action">
                    <IconButton
                        style={{zIndex: 99}}
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
                                <CardContent>
                                    <div className="targets">
                                        <a className="share-button">
                                            <img
                                                src="https://img.icons8.com/color/48/000000/facebook-new.png"
                                                alt="Facebook"
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Facebook
                                            </Typography>
                                        </a>

                                        <a className="share-button">
                                            <img
                                                src="https://img.icons8.com/color/48/000000/instagram-new.png"
                                                alt="Instagram"
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Instagram
                                            </Typography>
                                        </a>
                                        <a className="share-button">
                                            <img
                                                src="https://img.icons8.com/color/48/000000/twitter.png"
                                                alt="Twitter"
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Twitter
                                            </Typography>
                                        </a>
                                        <a className="share-button">
                                            <img
                                                src="https://img.icons8.com/color/48/000000/email.png"
                                                alt="Email"
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Email
                                            </Typography>
                                        </a>
                                    </div>
                                    <div className="link">
                                        <div className="pen-url">https://moviedb.com/movie/</div>
                                        <button className="btn">Copy Link</button>
                                    </div>
                                </CardContent>
                            </Card>
                </Backdrop>


        </>

    )
}