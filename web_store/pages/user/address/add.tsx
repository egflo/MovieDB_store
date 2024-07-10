import {useRouter} from "next/router";
import { useEffect, useState } from 'react';
import {auth, axiosInstance} from '../../../utils/firebase';
import {
    CircularProgress,
    Typography,
} from '@mui/material';
import AddressForm from "../../../components/forms/AddressForm";
import {Layout} from "../../../components/Layout";
import {GetServerSideProps} from "next";
import {Box} from "@mui/material";


const ADDRESS_URL = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/users/address`;


export default function AddAddressPage() {

    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            // @ts-ignore
            setUser(authUser);
        });

        return () => unsubscribe();
    }, []);

    return (
        <Box className="container-fluid" sx={{pt: 20}}>
            <AddressForm />
        </Box>
    );
}


AddAddressPage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);