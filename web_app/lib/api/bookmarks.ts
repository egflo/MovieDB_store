import { authed, url } from "./client";
import { Bookmark } from "@/lib/models/Bookmark";

// Bookmarks live in user_service, not movie_service.
const BOOKMARK = url("user", "bookmark/");

/**
 * The signed-in user's bookmarks, as a plain list. This used to call
 * GET /bookmark/?limit=…, which user_service never registers (its controller
 * maps "/all" twice, so "/" is missing) and expect a Page. The request failed,
 * so the Favorites page always said it couldn't load and every heart showed
 * unsaved. GET /bookmark/all is the endpoint that works, and it returns a list.
 */
export function getBookmarks(token: string) {
    // /all returns 10 by default; ask for plenty so every heart reflects the
    // user's real favourites.
    return authed(token).get(`${BOOKMARK}all?limit=500`).json<Bookmark[]>();
}

export function addBookmark(token: string, movieId: string, userId: string) {
    return authed(token)
        .post(BOOKMARK, { json: { movieId, userId, created: new Date() } })
        .json<Bookmark>();
}

/** Remove by bookmark id. */
export function removeBookmark(token: string, id: string) {
    return authed(token).delete(`${BOOKMARK}${id}`);
}

/** Remove by movie id, for the toggle on a movie page. */
export function removeBookmarkByMovie(token: string, movieId: string) {
    return authed(token).delete(`${BOOKMARK}movie/${movieId}`);
}
