import {signInWithEmailAndPassword} from 'firebase/auth';
import {useAuthState, useIdToken} from 'react-firebase-hooks/auth';
import {auth, axiosInstance} from "../utils/firebase";
import Button from "@mui/material/Button";
import {Layout} from "../components/Layout";
import ScrollPagination from "../components/ScrollPagination";
import {CardStyle} from "../components/CardStyle";
import {ContentType} from "../components/ContentType";
import {ViewType} from "../components/ViewType";
import useToastContext from "../hooks/useToastContext";
import useAuthContext from "../hooks/useAuthContext";
import {CircularProgress} from "@mui/material";
import {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import Header from "../components/Header";


const BOOKMARKS = 'movie-service/bookmark/?sortBy=created';

async function getIdToken(user: any) {
    if (user) {
        return await user.getIdToken(true);
    }
    return null;
}


export default function FavoritePage(props: any) {
    const [token, setToken] = useState("");

    useEffect(() => {
        async function getToken() {
            const token = await getIdToken(auth.currentUser);
            setToken(token);
        }
        getToken();
    }, [auth.currentUser]);

    if (token) {
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
                <Header title={"Bookmarks"}></Header>
                <ScrollPagination
                    path={BOOKMARKS}
                    style={CardStyle.EXPANDED}
                    type={ContentType.BOOKMARK}
                    view={ViewType.VERTICAL}
                    token={token}/>
            </Box>

        );
    }

    return (
        <CircularProgress/>
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

FavoritePage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);