import {signInWithEmailAndPassword} from 'firebase/auth';
import {useAuthState, useIdToken} from 'react-firebase-hooks/auth';
import {auth, axiosInstance} from "../utils/firebase";
import Button from "@mui/material/Button";
import {Layout} from "../components/Layout";
import ScrollPagination from "../components/ScrollPagination";
import {CardHeader, CircularProgress} from "@mui/material";
import {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import Header from "../components/Header";
import useSWR from "swr";
import {CartItem} from "../components/CartItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

const CART = 'inventory-service/cart/user/';

async function getIdToken(user: any) {
    if (user) {
        return await user.getIdToken(false);
    }
    return null;
}

const fetcher = async (url: string, token: string) => {
    const response = await axiosInstance.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}


function calculateTotal(items: any) {
    let total = 0;
    items.forEach((item: any) => {
        total += item.price * item.quantity;
    });
    return total;
}

export default function CartPage(props: any) {
    const [token, setToken] = useState("");

    const userId = auth.currentUser?.uid;
    const {data, error, mutate} = useSWR(CART + userId, async (url: string) => {
        const response = await axiosInstance.get(url, {
            headers: {

            }
        });
        return response.data;
    });

    if (error) {
        return <Box sx={{color: 'white'}}>Failed to Load</Box>
    }

    if (!data) {
        return <CircularProgress/>

    }

    return (

        <Box className="container-main">
            <Box
                className="results-container"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    p: 2,
                }}
            >
                <Header title={"Cart"}></Header>

                {data.map((item: any) => (
                    <CartItem item={item} key={item.id}></CartItem>
                ))}
            </Box>

            <Box className="sticky-container">
                <Card className="sticky">
                    <CardHeader title={"Order"}></CardHeader>

                    <CardContent>
                        <Typography variant="body1" color="text.secondary">
                            Subtotal: $15.00
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Taxes: Calculated at checkout
                        </Typography>
                        <Typography variant="h5" color="text.secondary">
                            Total: $15.00
                        </Typography>
                        <Box className={"sticky-content"}>
                            <Button variant="contained" color="primary" size="large" fullWidth>
                                Checkout
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

        </Box>

    );


};

export const getServerSideProps = async (context: any) => {
    const {req, res} = context;
    const token = await auth.currentUser?.getIdToken();
    if (token) {
        return {
            props: {
                token: token
            }
        };
    }
    return {
        props: {}
    };
}

CartPage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);