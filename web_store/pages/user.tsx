import Card from "@mui/material/Card";

import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import {auth} from "../utils/firebase";
import Button from "@mui/material/Button";
import {Layout} from "../components/Layout";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useRouter } from 'next/router'
import Header from "../components/Header";

const logout = () => {
    signOut(auth);
};

export default function UserPage() {
    let router = useRouter();

    const login = () => {
        router.push('/login');
    }

    const [user, loading, error] = useAuthState(auth);

    if (loading) {
        return (
            <Box>
                <p>Initialising User...</p>
            </Box>
        );
    }
    if (error) {
        return (
            <Box>
                <p>Error: {error.message}</p>
            </Box>
        );
    }

    if (user) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    backgroundColor: theme => theme.palette.background.paper,
                    width: "100vw",
                }}
            >
                <Header title={"User"}></Header>
                <Card>
                    <CardContent>
                        <div className="row align-items-center">
                            <div className="col-md-2">
                                <img
                                    src={"./firebase.png"}
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


        );
    }
    return <Button onClick={login}>Log in</Button>;
};

UserPage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);