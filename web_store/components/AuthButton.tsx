

import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import {auth} from "../utils/firebase";
import Button from "@mui/material/Button";
import {CircularProgress} from "@mui/material";
import {LogoutButton} from "./actions/Login";


const login = () => {
    signInWithEmailAndPassword(auth, 'test@test.com', 'password');
};
const logout = () => {
    signOut(auth);
};

export default function AuthButton() {
    const [user, loading, error] = useAuthState(auth);

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
            <LogoutButton/>
        );
    }

    return <Button onClick={login}>Log in</Button>;
};
