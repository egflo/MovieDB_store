import {Layout} from "../components/Layout";
import {GetServerSidePropsContext} from "next";
import nookies from "nookies";
import {useRouter} from "next/router";
import withAuth from "../components/withAuth";
import {CartComponent} from "../components/cart/Cart";

export default function CartPage(props: any) {
    const router = useRouter();
    const ProtectedCart = withAuth(CartComponent);

    return (
        <ProtectedCart/>
    )

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
            }
        }

    } catch (e) {
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