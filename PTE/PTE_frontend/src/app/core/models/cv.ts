import { Certification } from "./certification";
import { Education } from "./education";
import { Experience } from "./experience";
import { Project } from "./project";
import { Skill } from "./skill";
import { User } from "./user";

export class Cv{
        public _id?: string;
        public user?:any
        public summary?:String
        public education?:Education
        public certification?:Certification
        public skill?:Skill
        public project?:Project
        public experience?:Experience
    constructor(){}
    
}