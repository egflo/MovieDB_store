
import {Layout} from "../components/Layout";
import {CardStyle} from "../components/CardStyle";
import {ContentType} from "../components/ContentType";
import {ViewType} from "../components/ViewType";
import Box from "@mui/material/Box";
import Header from "../components/Header";
import {GetServerSideProps, GetServerSidePropsContext} from "next";
import nookies from "nookies";
import ScrollPagination from "../components/ScrollPagination";


const BOOKMARKS = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/bookmarks/?sortBy=created`;

export default function FavoritePage(props: any) {


    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                width: "100vw",
            }}
        >
            <Header title={"Bookmarks"}></Header>
            <ScrollPagination
                path={BOOKMARKS}
                style={CardStyle.EXPANDED}
                type={ContentType.MOVIE}
                view={ViewType.VERTICAL}
                token={props.token}/>
        </Box>

    );


};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    try {

        const cookies =  nookies.get(context);

        return {
            props: {
                token: cookies.token
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

FavoritePage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);