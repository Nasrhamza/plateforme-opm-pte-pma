import { Comment } from "./comment.model";
import { Company } from "./company.model";
import { User } from "./user.model";

export interface Post {
    _id : string
    content? : string;
    files? : string[];
    createdAt? : Date;
    user? : User;
    company? : Company;
    likes : User[]
    comments : number,
    isLiked? : boolean
}