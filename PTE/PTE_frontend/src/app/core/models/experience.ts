import { Cv } from "./cv"


export class Experience{
    _id?: string;
    cv?:Cv
    comapny?:String
    job?:String
    task_description?:String
    start?:Date
    end?: Date
    constructor(){}
}