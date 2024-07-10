import Button from "@mui/material/Button";
import {CardHeader, CircularProgress} from "@mui/material";
import Box from "@mui/material/Box";
import useSWR from "swr";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import Divider from "@mui/material/Divider";
import {axiosInstance, fetchCart} from "../../api/fetcher";
import {Cart} from "../../models/Cart";
import {CartItem} from "./CartItem";


const CART_API = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;


const fetcher = (url: string, token: string) =>
    axiosInstance.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);

function formatPrice(price: number) {
    const convert = price / 100;
    return convert.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}

function calculateTotal(items: any) {
    return items
        .map((item: any) => item.price * item.quantity)
        .reduce((sum: any, i: any) => sum + i, 0);
}

function useCart(token: string) {
    const {data, error, mutate} = useSWR([CART_API, token], fetcher);

    return {
        data,
        isLoading: !error && !data,
        isError: error,
        mutate
    }
}


export const CartComponent = (props: any) => {
    const router = useRouter();

    const {data, error, mutate} = useSWR('cart', fetchCart);

    if (error) {
        return <Box sx={{color: 'white'}}>Failed to Load</Box>
    }

    if (!data) {
        return <CircularProgress/>
    }

    return (

        <Box className={"pr-3 pl-3"}>


            <div className="container-main">


                {data.length === 0 && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            padding: 2,
                        }}
                    >
                        <Typography variant="h5" color="text.secondary">
                            Your cart is empty
                        </Typography>
                    </div>
                )} {data.length > 0 && (

                <>
                    <div className="flex flex-col gap-2  w-full md:w-1/2 pb-5">
                        {data.map((item: Cart) => (
                            <CartItem item={item} key={item.id} mutate={mutate}/>
                        ))}
                    </div>

                    <div className="sticky-container">
                        <Card className="sticky w-full">
                            <CardContent className={"flex flex-col gap-2"}>
                                <Box className={"flex justify-between"}>
                                    <Typography variant="h6" color="text.secondary">
                                        Subtotal ({data.length} Item)
                                    </Typography>
                                    <Typography variant="h6" color="text.primary">
                                        {formatPrice(calculateTotal(data))}
                                    </Typography>
                                </Box>
                                <Divider className={"bg-zinc-500 m-1"}></Divider>
                                <Typography variant="body2" color="text.secondary">
                                    Taxes may apply for certain states.
                                </Typography>
                                <Box className={"sticky-content"}>
                                    <Button
                                        className={"bg-blue-800"}
                                        onClick={() => router.push('/checkout')}
                                        variant="contained" color="primary" size="large" fullWidth>
                                        Buy Now
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
            </div>
        </Box>

    );

};
