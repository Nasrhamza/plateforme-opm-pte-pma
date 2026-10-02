import { Cv } from "./cv"


export class Certification{
    _id?: string;
    cv?:Cv
    domaine?:string
    credential?:string
    cert_file?:string
    date?:Date
   
    constructor(){}
}