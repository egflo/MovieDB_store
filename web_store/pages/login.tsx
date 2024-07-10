import Box from "@mui/material/Box";
import {LoginForm} from "../components/forms/LoginForm";
import {useRouter} from "next/router";
import useToastContext from "../hooks/useToastContext";
import {useSignInWithEmailAndPassword} from "react-firebase-hooks/auth";
import {auth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup} from "../utils/firebase";
import {Button, Card, CircularProgress, TextField, Typography} from "@mui/material";
import React, {useState} from "react";
import TheatersIcon from "@mui/icons-material/Theaters";

export default function LoginPage() {
    const ref = React.useRef(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const toast = useToastContext();


    const handleEmailLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password); // Sign in with email and password
            router.push('/'); // Redirect after successful login
        } catch (err) {
            setError('Invalid email or password.'); // Set error message on failure
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider(); // Google authentication provider
        try {
            await signInWithPopup(auth, provider); // Sign in with Google
            router.push('/'); // Redirect after successful login
        } catch (err) {
            setError('Google sign-in failed.'); // Set error message on failure
        }
    };

    return (
        <Box className={'flex justify-center items-center h-screen bg-zinc-950'}>
            <Card
                sx={{
                    maxWidth: '400px',
                    margin: 'auto',
                    padding: '2rem',
                    textAlign: 'center',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                }}
            >

                <Typography variant="h5" component="h1" gutterBottom>
                    Login
                </Typography>

                <TextField
                    fullWidth
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    type="email"
                />
                <TextField
                    fullWidth
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    type="password"
                />
                {error && <Typography color="error">{error}</Typography>} {/* Display error message */}
                <Button variant="contained" color="primary" fullWidth onClick={handleEmailLogin}>
                    Login with Email
                </Button>
                <Button variant="outlined" color="primary" fullWidth onClick={handleGoogleSignIn} sx={{ marginTop: '1rem' }}>
                    Sign in with Google
                </Button>
            </Card>

        </Box>
    );
}