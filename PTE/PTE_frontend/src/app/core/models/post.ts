import { Comment } from "./comment"
import { Like } from "./like"
import { User } from "./user"

export class post{
    _id?:string
    description?:String
    images?:[String]
    status?:String
    date?:Date
    user?:User
    comments?:Comment
    like?:Like

   constructor(){}
   }