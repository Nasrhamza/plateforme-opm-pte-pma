import { Project } from "./project.model";

export interface ProjectFile {
    _id : string;
    file : string;
    project : Project;
    type : string;
}