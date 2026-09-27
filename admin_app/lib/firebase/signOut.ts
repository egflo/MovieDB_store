import { getAuth, signOut as firebaseSignOut } from "firebase/auth";
import { app } from "./firebase";

/**
 * Sign out of Firebase and clear the session cookie, then load /login fresh.
 * A full load, not router.push: the root layout holds the signed-in user and
 * client navigation would keep it.
 */
export async function signOut(): Promise<void> {
    await firebaseSignOut(getAuth(app));
    await fetch("/api/logout");
    window.location.replace("/login");
}
