import { Cv } from "./cv";
export class User{
         _id?:string
         bio?:String
         
         matricule?:string
         firstName?:string
         lastName?:string
         phone?:string 
         email?:string
         password?:string
         image?:string
         external?:boolean
         external_cv?:string
         signature?:string
         nationality?:string
         familySituation?:string
         birthDate?:Date
         address?:string
         departement?:string
         drivingLisence?:boolean
         gender?:string
         experience?:number
         hiringDate?:Date
         roles?:string
         title?:string
         teamLeader?:boolean
         cv?:Cv
         token?:string
         
}