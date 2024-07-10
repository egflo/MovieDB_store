import React, {DependencyList, EffectCallback, useEffect, useRef, useState} from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from '@mui/material/Divider';
import StarIcon from '@mui/icons-material/Star';
import Link from "next/link";
import {CriticReview} from "../../models/CriticReview";


const useEffectAfterMount = (cb: EffectCallback, dependencies: DependencyList | undefined) => {
    const mounted = useRef(true);

    useEffect(() => {
        if (!mounted.current) {
            return cb();
        }
        mounted.current = false;
    }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};

export default function ReviewCard({review}:{review: CriticReview}) {
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const didMountRef = useRef(false);


    function handleCardClick(value: CriticReview) {
        setOpenBackdrop(true);
    }

    function handleClose() {
        setOpenBackdrop(false);
    }

    function formatDateString(date: string) {
        let d = new Date(date);
        //Ex Aug 9, 2021
        return d.toLocaleString('default', { month: 'short' }) + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

    return (
        <>
            <Card
                sx={{ minWidth: 275, maxWidth: 275, cursor: 'pointer' }}>
                <CardContent sx={{height: 250}} onClick={() => handleCardClick(review)}>

                    <div className={'flex flex-col h-full'}>
                        <Box className={'flex gap-2'} sx={{minHeight: 150}}>
                            <div className={'flex flex-col gap-0 items-center'}>
                                <img className="content__rating" style={{height: 30}}
                                     src={"/" + review.review_state + ".png"} alt={"tomato"}></img>
                                <Typography variant="subtitle2" component="div" className={'mt-2'}>
                                    {review.score}
                                </Typography>
                            </div>

                            <Box>

                                <Box className={'flex flex-col  pb-2'}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <Typography color="text.primary" variant="body2">
                                            {review.critic_name}
                                        </Typography>


                                        {review.isTopCritic &&
                                            <div className={'flex gap-0 items-center'}>
                                                <StarIcon fontSize={'small'} sx={{color: 'red'}}/>
                                                <Typography color="red" variant="body2" className={'font-bold'}>
                                                    {"Top Critic"}
                                                </Typography>
                                            </div>
                                        }

                                    </Box>

                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <Typography color="text.secondary" variant="caption">
                                            {review.publication_name}
                                        </Typography>
                                    </Box>


                                </Box>

                                <Typography variant="body2" component="div" style={{
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    width: '100%',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 5,
                                    WebkitBoxOrient: 'vertical',
                                }}>
                                    {review.text}
                                </Typography>

                                <Typography variant="caption" color="text.secondary" component="div" style={{
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    width: '100%',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                }}>
                                    <Link
                                        style={{textDecoration: 'none'}}
                                        href={review.review_url} passHref> Read More </Link>
                                </Typography>

                            </Box>
                        </Box>

                    </div>

                    <Box
                        className={'flex flex-row justify-end'}
                        sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <Typography color="text.secondary" variant="caption">
                            {formatDateString(review.creation_date)}
                        </Typography>
                    </Box>

                </CardContent>

            </Card>

        </>
)

}