
import { getAnalytics } from "firebase/analytics";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import useToastContext from "../hooks/useToastContext";
import {ToastType} from "../components/Toast";

import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize firebase
const app = initializeApp(firebaseConfig);
// Initialize auth && firestore with the 'firebaseApp' property
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;


async function getIdToken() {
    let user = auth.currentUser;

    if (user) {
        return await user.getIdToken(true);
    } else {
        return new Promise((resolve, reject) => {
            const unsub = auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const token = await user.getIdToken(true);
                    resolve(token)
                } else {
                    console.log("User not logged in")
                    reject(new Error("User not logged in"))
                }
                unsub();
            });
        } )
    }
}

export const fetcher = async (url) => {
    const token = await getIdToken();
    if (token) {
        return axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
    return axios.get(url);
}



export const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
})

axiosInstance.interceptors.request.use(async config => {
    return config
}, (error) => {
    return Promise.reject(error)
})


const login = (username, password) => {
    signInWithEmailAndPassword(auth, username, password)
};
const logout = () => {
    signOut(auth);
};

export function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        'login_hint': 'user@example.com'
    });

    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // ...
        }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(errorCode, errorMessage, email, credential);
    });
}

export function signInWithEmail(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log(user);
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
}

export function signOutUser() {
    signOut(auth).then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
    });
}

export function isUserLoggedIn() {
    return auth.currentUser;
}