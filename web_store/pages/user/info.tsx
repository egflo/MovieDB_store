import Card from "@mui/material/Card";
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import {auth} from "../../utils/firebase";
import Button from "@mui/material/Button";
import {Layout} from "../../components/Layout";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useRouter } from 'next/router'
import {
    CreditCardOffOutlined, CreditCardRounded,
    FavoriteBorderOutlined,
    HouseOutlined,
    LocalShippingOutlined
} from "@mui/icons-material";

const logout = () => {
    signOut(auth);
};

export default function Info() {
    let router = useRouter();

    const login = () => {
        router.push('/login');
    }

    const [user, loading, error] = useAuthState(auth);

    if (loading) {
        return (
            <Box className="container-fluid d-flex justify-content-center align-items-center h-100" sx={{pt: 20}}>
                <Typography variant="h4" component="div" color={"white"}>
                    Loading...
                </Typography>
            </Box>
        );
    }
    if (error) {
        return (
            <Box className="container-fluid d-flex justify-content-center align-items-center h-100" sx={{pt: 20}}>
                <Typography variant="h4" component="div" color={"white"}>
                    Error: {error.message}
                </Typography>
            </Box>

        );
    }

    if (user) {
        return (
            <Box sx={{display: 'flex', flexDirection: 'column',  width: '100%', alignItems: 'center'}}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        width: '100%',
                        alignItems: 'center',
                    }}
                >
\                    <Card>
                        <CardContent>
                            <div className="row align-items-center">
                                <div className="col-md-2">
                                    <img
                                        src={"../firebase.png"}
                                        alt="User's profile picture"
                                        className="rounded-circle img-fluid profile-picture"
                                    />
                                </div>
                                <div className="col-md  text-md-left">
                                    <Typography variant="h5" component="div">
                                        {user.email}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        UID: {user.uid}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Provider ID: {user.providerId}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Email Verified: {user.emailVerified ? 'Yes' : 'No'}
                                    </Typography>
                                </div>

                                <div className="col-md-3">
                                    <Button onClick={logout}>Log out</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Box>

                <Box className="container-fluid" >

                        <Box className="row flex-row flex-wrap g-2">

                            <Box className="col-md-4">

                                <Card className={'action-card'}
                                        onClick={() => router.push('/user/orders')}>

                                    <CardContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', textAlign: 'left' }}>

                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: "inherit" }}>
                                                <LocalShippingOutlined sx={{ fontSize: 75 }} color={"primary"}/>
                                            </Box>

                                            <Box>
                                                <Typography variant="h6" component="div">
                                                    Your Orders
                                                </Typography>
                                                <Typography variant="subtitle2" component="div" color="grey">
                                                    Track, return, or buy things again
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>

                            </Box>

                            <Box className="col-md-4">
                                <Card className={'action-card'}
                                        onClick={() => router.push('/user/favorites')}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', textAlign: 'left' }}>

                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: "inherit" }}>
                                                <FavoriteBorderOutlined sx={{ fontSize: 75 }} color={"primary"}/>
                                            </Box>

                                            <Box>
                                                <Typography variant="h6" component="div">
                                                    Your Bookmarks
                                                </Typography>
                                                <Typography variant="subtitle2" component="div" color="grey">
                                                    Save items you like for later
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>

                            <Box className="col-md-4">
                                <Card className={'action-card'}
                                        onClick={() => router.push('/user/address/info')}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', textAlign: 'left' }}>

                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: "inherit" }}>
                                                <HouseOutlined sx={{ fontSize: 75 }} color={"primary"}/>
                                            </Box>

                                            <Box>
                                                <Typography variant="h6" component="div">
                                                    Your Addresses
                                                </Typography>
                                                <Typography variant="subtitle2" component="div" color="grey">
                                                    Manage your addresses
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>


                            <Box className="col-md-4">
                                <Card className={'action-card'}
                                      onClick={() => router.push('/user/payments')}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', textAlign: 'left' }}>

                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: "inherit" }}>
                                                <CreditCardRounded sx={{ fontSize: 75 }} color={"primary"}/>
                                            </Box>

                                            <Box>
                                                <Typography variant="h6" component="div">
                                                    Your Payments
                                                </Typography>
                                                <Typography variant="subtitle2" component="div" color="grey">
                                                    Manage your payments
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Box>
                </Box>
            </Box>

        );
    }
    return <Button onClick={login}>Log in</Button>;
};




Info.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);