import { Project } from "./project.model";
import { User } from "./user.model";

export interface ProcesV {
    _id : string;
    Titre : string;
    Project : Project;
    Type_Communication : string;
    Date : string;
    Sender : User;
    equipe : User[];
    description : string;
}