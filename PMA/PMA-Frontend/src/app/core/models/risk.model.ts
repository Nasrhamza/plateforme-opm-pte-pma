import { Project } from "./project.model";
import { User } from "./user.model";

export interface Risk {
    _id : string;
    title : string;
    action : string;
    impact : string;
    details : string;
    date : Date;
    project : Project;
    user : User;
}