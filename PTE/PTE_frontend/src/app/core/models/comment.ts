import { post } from "./post"
import { User } from "./user"

export class Comment{
    _id?:string
    text?:String
    user?:User
    post?:post
   constructor(){}
   }