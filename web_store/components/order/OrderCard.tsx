

import {Order} from "../../models/Order";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Image from "next/image";
import Link from "next/link";
import Button from "@mui/material/Button";
import {SeverityPill} from "./severity-pill";
import IconButton from "@mui/material/IconButton";
import {ChevronRightOutlined} from "@mui/icons-material";
import {useRouter} from "next/router";
import {CardHeader} from "@mui/material";

type OrderProps = {
     order: Order
}

export function OrderCard({order}: OrderProps) {
    const router = useRouter();

    function formatDate(date: number) {
        let d = new Date(date);
        return d.toLocaleDateString();
    }

    function formatCurrency(value: number) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        return formatter.format(value/100);
    }

    function onClick() {
        router.push(`/user/order/${order.id}`)
    }

    return (


        <>
            <Card className={"min-w-full"}>
                <Box className={"flex flex-row gap-1 bg-gray-800  rounded-t-md"}>
                    <div className={"w-full p-2"}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant="subtitle1" component="div" sx={{flexGrow: 1, color: 'inherit'}}>
                                <span className={"color-zinc-700"}>Order</span> #{order.id}
                            </Typography>

                            <Typography variant="subtitle1" component="div"
                                        sx={{flexGrow: 1, color: 'inherit', textAlign: "end"}}>
                                {formatDate(order.created)}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <SeverityPill
                                color={(order.status === 'SHIPPED' && 'success')
                                    || (order.status === 'REFUNDED' && 'error')
                                    || (order.status === 'PENDING' && 'warning')
                                    || (order.status === 'CANCELLED' && 'error')
                                    || (order.status === 'CREATED' && 'info')
                                    || 'warning'}
                            >
                                {order.status}
                            </SeverityPill>


                            <Typography variant="subtitle1" component="div"
                                        sx={{flexGrow: 1, color: 'inherit', textAlign: "end"}}>
                                Total: {formatCurrency(order.total)}
                            </Typography>

                        </Box>
                    </div>
                    <div className={"flex flex-row gap-1"}>
                        <IconButton onClick={onClick}>
                            <ChevronRightOutlined/>
                        </IconButton>
                    </div>
                </Box>

                <Divider />

                <Box className={"flex flex-col gap-1"}>
                    {order.items.map((item) => (
                        <Box key={item.id}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'left',
                                    gap: 1,
                                    p: 1,
                                }}
                            >

                                <Box className={"rounded-md bg-gray-800"}>
                                    <img src={item.photo} alt={item.description} className={"w-36 h-40 rounded-md"}/>
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        justifyContent: 'center',
                                        gap: 1,
                                        width: '100%',
                                        p: 1
                                    }}>

                                    <Link href={`/movie/${item.sku}`}
                                          style={{
                                              textDecoration: 'none',
                                          }}
                                    >

                                        <Typography variant="inherit" component="div"
                                                    className={"text-blue-700 font-bold"}
                                                    sx={{color: 'inherit', textAlign: "left"}}>
                                            {item.description}
                                        </Typography>
                                    </Link>

                                    <Typography variant="body2" component="div"
                                                sx={{color: 'inherit', textAlign: "end"}}>
                                        Price: {formatCurrency(item.price)}
                                    </Typography>

                                    <Typography variant="body2" component="div"
                                                sx={{color: 'inherit', textAlign: "end"}}>
                                        Quantity: {item.quantity}
                                    </Typography>

                                    <button className={"bg-blue-700 text-white rounded-md p-2"}
                                            onClick={onClick}>
                                        More Info
                                    </button>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>

            </Card>

        </>


    )
}