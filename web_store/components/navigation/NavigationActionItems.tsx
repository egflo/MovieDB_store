import IconButton from "@mui/material/IconButton";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import {auth} from "../../utils/firebase";
import React from "react";
import {useRouter} from "next/router";
import {CircularProgress} from "@mui/material";
import {useAuthState} from "react-firebase-hooks/auth";
import {Logout} from "../actions/Logout";
import {AccountCircleOutlined, FavoriteBorderOutlined, ShoppingBagOutlined, ShoppingBasket} from "@mui/icons-material";
import {Login} from "../actions/Login";
import { Nav } from "react-bootstrap";
import {CartNavIcon} from "./CartNavIcon";


export default function NavigationActionItems() {
    const router = useRouter();
    const [user, loading, error] = useAuthState(auth);

    const handleFavoritesClick = (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        router.push('/user/favorites')
    }

    const handleAccountClick = (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        router.push('/user/info')
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
                <Nav.Item>

                <IconButton
                    onClick={handleAccountClick}
                    size="large"
                    edge="end"
                    color="inherit"
                    aria-label="Favorites"
                    sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                    <div className={'flex flex-row align-middle gap-2'}>
                        <AccountCircleOutlined fontSize={'medium'} className={"blue-500"}/>
                        <div className={'block md:hidden'}>
                            <Typography variant="subtitle1">
                                Account
                            </Typography>
                        </div>
                    </div>
                </IconButton>

                </Nav.Item>

                <Nav.Item>
                <IconButton
                    onClick={handleFavoritesClick}
                    size="large"
                    edge="end"
                    color="inherit"
                    aria-label="Favorites"
                    sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                    <div className={'flex flex-row align-middle gap-2'}>
                    <FavoriteBorderOutlined fontSize={'medium'}/>
                        <div className={'block md:hidden'}>
                            <Typography variant="subtitle1">
                                Favorites
                            </Typography>
                        </div>
                    </div>
                </IconButton>

                </Nav.Item>

                <Nav.Item>
                    <CartNavIcon user={user} />
                </Nav.Item>

                <Nav.Item>
                        <Logout/>
                </Nav.Item>

            </>
        );
    }

    return (
        <>
            <Nav.Item>
                <IconButton
                    onClick={() => router.push('/login')}
                    size="large"
                    edge="end"
                    color="inherit"
                    aria-label="Login"
                    sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                    <div className={'flex flex-row align-middle gap-2'}>
                        <LoginIcon fontSize={'medium'}/>
                        <div className={'block md:hidden'}>
                            <Typography variant="subtitle1">
                                Login
                            </Typography>
                        </div>
                    </div>
                </IconButton>

            </Nav.Item>
        </>
    );
}