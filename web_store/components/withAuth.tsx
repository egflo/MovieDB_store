// components/withAuth.tsx
import React, { useEffect, useState, ComponentType } from 'react';
import {auth} from "../utils/firebase";
import { useRouter } from 'next/router';
import {User} from "@firebase/auth";
import {CircularProgress} from "@mui/material";

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>): React.FC<P> => {
    const ComponentWithAuth: React.FC<P> = (props) => {
        const [loading, setLoading] = useState(true);
        const [user, setUser] = useState<User | null>(null);
        const router = useRouter();

        useEffect(() => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                if (user) {
                    setUser(user);
                } else {
                    router.push('/login');
                }
                setLoading(false);
            });

            return () => unsubscribe();
        }, [router]);

        if (loading) {
            return <CircularProgress/>;
        }

        if (!user) {
            return null; // or a redirect message
        }

        return <WrappedComponent {...props} />;
    };

    return ComponentWithAuth;
};

export default withAuth;
