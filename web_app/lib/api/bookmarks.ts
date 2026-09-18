import { authed, url } from "./client";
import { Bookmark } from "@/lib/models/Bookmark";
import { Page } from "@/lib/models/Page";

// Bookmarks live in user_service, not movie_service.
const BOOKMARK = url("user", "bookmark/");

export function getBookmarks(token: string, limit = 50) {
    return authed(token)
        .get(`${BOOKMARK}?limit=${limit}&sortBy=created`)
        .json<Page<Bookmark>>();
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
