import {User} from "@/lib/models/User";
import {Movie} from "@/lib/models/Movie";


export interface Comment {
    id: string;
    userId: string;
    movieId: string;
    text: string;
    date: Date;
    likes: number;
    dislikes: number;
    user: User;
    movie: Movie;
}