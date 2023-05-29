

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
        return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
    }

    function onClick() {
        router.push(`/order/${order.id}`)
    }

    return (


        <div className={"w-[90vw]"}>
            <Card>
                <CardContent>

                    <div className={"flex flex-row gap-1"}>

                        <div className={"w-full"}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1, color: 'inherit'}}>
                                    <span className={"color-zinc-700"}>Order</span> #{order.id}
                                </Typography>

                                <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1, color: 'inherit', textAlign: "end"}}>
                                    Order Date: {formatDate(order.created)}
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


                                <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1, color: 'inherit',textAlign: "end"}}>
                                    Order Total: {formatCurrency(order.total)}
                                </Typography>

                            </Box>
                        </div>



                        <div className={"flex flex-row gap-1"}>
                            <IconButton onClick={onClick}>
                                <ChevronRightOutlined/>
                            </IconButton>
                        </div>
                    </div>




                    <Divider sx={{marginTop: 1, marginBottom: 1}}/>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        {order.items.map((item) => (
                            <Box key={item.id}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'left',
                                        gap: 1,
                                    }}
                                >
                                    <Image src={item.photo} width={100} height={150} alt={item.description}/>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                            width: '100%',
                                            p: 1
                                        }}>

                                        <Link href={`/movie/${item.sku}`}
                                              style={{
                                                  textDecoration: 'none',
                                              }}
                                        >

                                            <Typography variant="h6" component="div" sx={{color: 'inherit', textAlign: "end"}}>
                                                {item.description}
                                            </Typography>
                                        </Link>

                                        <Typography variant="subtitle2" component="div" sx={{  color: 'inherit', textAlign: "end"}}>
                                            Price: {formatCurrency(item.price)}
                                        </Typography>

                                        <Typography variant="subtitle2" component="div" sx={{color: 'inherit', textAlign: "end"}}>
                                            Quantity: {item.quantity}
                                        </Typography>

                                        <Button variant="contained" sx={{marginTop: 1, marginBottom: 1}}>Reorder</Button>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                </CardContent>
            </Card>
        </div>

    )
}