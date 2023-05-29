import IconButton from "@mui/material/IconButton";
import {ShoppingBagOutlined} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import useSWR from "swr";
import {axiosInstance} from "../../utils/firebase";
import {Badge, CircularProgress} from "@mui/material";
import useAuthContext from "../../hooks/useAuthContext";
import {useEffect, useState} from "react";

interface CartNavIconProps {
    user: any;
}

const CART = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;


const fetcher = (url: string, token: string) =>
    axiosInstance.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);

function useCart(token: string) {
    const {data, error, mutate} = useSWR([CART, token], fetcher);

    return {
        data,
        isLoading: !error && !data,
        isError: error,
        mutate
    }
}

export  function CartNavIcon(props: CartNavIconProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(0);
    const auth = useAuthContext();


    const {data, isLoading, isError, mutate} = useCart(auth.token || '' as string);

    const handleCartClick = (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        router.push('/cart')
    }

    useEffect(() => {
        if (data) {
            const count = data.reduce((acc: number, item: any) => {
                return acc + item.quantity;
            }, 0);
            setQuantity(count);
        }
    } , [data])

    return (
        <IconButton
            onClick={handleCartClick}
            size="large"
            edge="end"
            color="inherit"
            aria-label="Favorites"
            sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
            <div className={'flex flex-row align-middle gap-2'}>
                <Badge badgeContent={quantity} color="secondary">
                    <ShoppingBagOutlined fontSize={'medium'}/>
                </Badge>

                <div className={'block md:hidden'}>
                    <Typography variant="subtitle1">
                        Cart
                    </Typography>
                </div>
            </div>
        </IconButton>
    )
}