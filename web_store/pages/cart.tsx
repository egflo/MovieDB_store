import Button from "@mui/material/Button";
import {Layout} from "../components/Layout";
import {CardHeader, CircularProgress} from "@mui/material";
import Box from "@mui/material/Box";
import Header from "../components/Header";
import useSWR from "swr";
import {CartItem} from "../components/CartItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {GetServerSidePropsContext} from "next";
import nookies from "nookies";
import {axiosInstance} from "../utils/firebase";
import {useRouter} from "next/router";
import {Cart} from "../models/Cart";
import Divider from "@mui/material/Divider";

const CART = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;

const fetcher = (url: string, token: string) =>
    axiosInstance.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);

function formatPrice(price: number) {
    return price.toLocaleString('en-US', {
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
    const {data, error, mutate} = useSWR([CART, token], fetcher);

    return {
        data,
        isLoading: !error && !data,
        isError: error,
        mutate
    }
}


export default function CartPage(props: any) {
    const router = useRouter();

    const {data, isLoading, isError, mutate} = useCart(props.token);

    if (isError) {
        return <Box sx={{color: 'white'}}>Failed to Load</Box>
    }

    if (isLoading) {
        return <CircularProgress/>
    }

    return (
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
                    <div
                        className="results-container"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            padding: 2,
                        }}
                    >

                        {data.map((item: Cart) => (
                            <CartItem item={item} key={item.id} mutate={mutate}/>
                        ))}
                    </div>

                    <div className="sticky-container">
                        <Card className="sticky w-full">
                            <CardContent>
                                <Typography variant="h6" color="text.primary">
                                    Order Summary
                                </Typography>
                                <Divider className={"bg-zinc-500 m-1"}></Divider>
                                <Typography variant="body1" color="text.secondary">
                                    Subtotal: {formatPrice(calculateTotal(data))}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Taxes: Calculated at checkout
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Total: {formatPrice(calculateTotal(data))}
                                </Typography>
                                <Box className={"sticky-content"}>
                                    <Button
                                        className={"bg-blue-800"}
                                        onClick={() => router.push('/checkout')}
                                        variant="contained" color="primary" size="large" fullWidth>
                                        Checkout
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}


        </div>


    );


};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    try {
        const cookies = nookies.get(context);
        if (!cookies.token) {
            return {
                redirect: {
                    destination: '/',
                },
                props: {} as never,
            }
        }

        return {
            props: {
                token: cookies.token,
                //uid: uid
            }
        }

    }
    catch (e) {
        return {
            redirect: {
                destination: '/',
            },
            props: {} as never,
        }
    }
}

CartPage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);