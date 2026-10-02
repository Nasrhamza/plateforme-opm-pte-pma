import { Post } from "./post.model";
import { User } from "./user.model";

export interface Comment {
    _id : string
    comment : string,
    user : User;
    post : Post;
    createdAt : Date
}