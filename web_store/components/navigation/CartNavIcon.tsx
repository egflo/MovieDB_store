import IconButton from "@mui/material/IconButton";
import {ShoppingBagOutlined} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import {Badge, CircularProgress} from "@mui/material";
import useAuthContext from "../../hooks/useAuthContext";
import {useCart} from "../../contexts/CartContext";

interface CartNavIconProps {
    user: any;
}

export  function CartNavIcon(props: CartNavIconProps) {
    const router = useRouter();
    const auth = useAuthContext();
    const {cartCount, loading } = useCart();



    const handleCartClick = (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        router.push('/cart')
    }

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
                <Badge badgeContent={loading ? <CircularProgress size={20} color={'inherit'}/> : cartCount} color="primary">
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