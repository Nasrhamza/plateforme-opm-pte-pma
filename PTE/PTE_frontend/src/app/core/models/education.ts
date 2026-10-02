import { Cv } from "./cv"


export class Education{
    _id?: string;
    cv?:Cv
    establishment?:String
    section?:String
    diploma?:String
    year_start?:Date
    year_end?:Date
   constructor(){}
}