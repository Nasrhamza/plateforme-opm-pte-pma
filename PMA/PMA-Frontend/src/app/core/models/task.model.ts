import { Project } from "./project.model";
import { User } from "./user.model";

export interface Task {
    _id : string;
    Title : string;
    Project : Project;
    Details : string;
    Status : string;
    StartDate : string;
    Deadline : Date;
    Executor : User[];
    progress : number;
    Priority : string;
    closedAt : Date;
    ratingWeight? : number;
    note? : number;
    ref? : String;
    companions? : User[]
}