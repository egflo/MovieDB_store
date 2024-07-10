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

interface AddressProps {
    id: String;
}

export default function EditAddressPage({id}: AddressProps) {

    const router = useRouter();
    const [user, setUser] = useState(null);
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            // @ts-ignore
            setUser(authUser);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchAddress = async () => {
            if (id) { // Ensure 'id' and 'user' are available
                try {
                    // Get Firebase Auth token
                    const token = await auth.currentUser?.getIdToken();
                    const response = await axiosInstance.get(ADDRESS_URL + `/${id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`, // Add token to request headers
                        },
                    });
                    setAddress(response.data);
                    setLoading(false); // Data is loaded
                } catch (error) {
                    console.error("Error fetching address:", error);
                    setLoading(false);
                }
            }
        };

        fetchAddress(); // Fetch the address if ID and user are present
    }, [id, user]); // Re-run the effect when 'id' or 'user' changes

    const handleSave = async () => {
        // Implement your save logic here
        try {
            const response = await axiosInstance.put(`/users/address/${id}`, address); // Update the address
            console.log("Address updated:", response.data);
            //router.push("/addresses"); // Redirect to the addresses list after saving
        } catch (error) {
            console.error("Error updating address:", error);
        }
    };

    if (loading) {
        return <CircularProgress />; // Show a loading spinner while fetching data
    }

    if (!address) {
        return <Typography>No address found for ID: {id}</Typography>; // Handle missing address
    }

    console.log(address);

    return (
        <Box className="container-fluid" sx={{pt: 20}}>
            <AddressForm address={address} />
        </Box>
    );
}


export const getServerSideProps: GetServerSideProps = async (context) => {

    const id = context.query.id as string;

    return {
        props: {
            id: id,
        }
    }
}


EditAddressPage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);