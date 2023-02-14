import IconButton from "@mui/material/IconButton";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LogoutIcon from "@mui/icons-material/Logout";
import {auth} from "../../utils/firebase";
import React from "react";
import {useRouter} from "next/router";
import {CircularProgress} from "@mui/material";
import {useAuthState} from "react-firebase-hooks/auth";
import {Logout} from "../actions/Logout";
import {ShoppingBasket} from "@mui/icons-material";
import {Login} from "../actions/Login";


export default function NavigationActionItems() {
    const router = useRouter();
    const [user, loading, error] = useAuthState(auth);
    const handleFavoritesClick = (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        router.push('/favorites')
    }

    const handleAccountClick = (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        router.push('/user')
    }

    const handleCartClick = (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        router.push('/cart')
    }

    if (loading) {
        return (
            <CircularProgress/>
        );
    }
    if (error) {
        return (
            <div>
                <p>Error: {error.message}</p>
            </div>
        );
    }

    if (user) {
        return (
            <>
                <IconButton
                    onClick={handleAccountClick}
                    size="large"
                    edge="end"
                    color="inherit"
                    aria-label="Favorites"
                    sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                    <AccountCircleIcon />
                    <Typography variant="subtitle1" noWrap component="div" sx={{ display: { color:'inherit' } }}>
                        Account
                    </Typography>
                </IconButton>

                <IconButton
                    onClick={handleFavoritesClick}
                    size="large"
                    edge="end"
                    color="inherit"
                    aria-label="Favorites"
                    sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                    <FavoriteIcon />
                    <Typography variant="subtitle1" noWrap component="div" sx={{ display: { color:'inherit' } }}>
                        Favorites
                    </Typography>
                </IconButton>

                <IconButton
                    onClick={handleCartClick}
                    size="large"
                    edge="end"
                    color="inherit"
                    aria-label="Favorites"
                    sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                    <ShoppingBasket />
                    <Typography variant="subtitle1" noWrap component="div" sx={{ display: { color:'inherit' } }}>
                        Cart
                    </Typography>
                </IconButton>

                <Logout/>

            </>
        );
    }

    return (
        <>
            <Login></Login>
        </>
    );
}