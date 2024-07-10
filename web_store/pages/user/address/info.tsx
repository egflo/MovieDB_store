import { useState, useEffect, Key} from 'react';

import {useRouter} from 'next/router';
import {auth} from "../../../utils/firebase";
import {Layout} from "../../../components/Layout";
import withAuth from "../../../components/withAuth";
import Addresses from "../../../components/user/Addresses";


export default function AddressesPage() {
    const [user, setUser] = useState(null);
    const router = useRouter();
    const ProtectedAddresses = withAuth(Addresses);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            // @ts-ignore
            setUser(authUser); // Set user when authentication state changes
        });

        return () => unsubscribe(); // Cleanup on component unmount
    }, []);

    return (
        <ProtectedAddresses/>
    )

}


AddressesPage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);