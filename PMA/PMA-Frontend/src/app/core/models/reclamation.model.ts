import { Project } from "./project.model";
import { User } from "./user.model";

export interface Reclamation {
    _id : string;
    Title : string;
    Comment? : string;
    CodeRec : string;
    reponse? : string;
    Type_Reclamation : string;
    Addeddate : Date;
    client : User;
    project : Project;
    status? : String;
}