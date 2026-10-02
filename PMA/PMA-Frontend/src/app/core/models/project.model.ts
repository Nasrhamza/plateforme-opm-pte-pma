import { ProjectRating } from "./projectRating.model";
import { User } from "./user.model";

export interface Project {
    _id : string;
    Projectname : string;
    description : string;
    status : string;
    TeamLeader : User;
    teamLeaderNote : number;
    dateFin : Date;
    type : string;
    dateDebut : Date;
    file : string;
    lettre? : string;

    client : User;
    equipe : User[];
    note_Client? : number;
    priority? : string;
    note_Admin? : number;
    progress? : number;
    closedAt? : Date;

    kickoff? : string;
    HLD_LLD? : string;
    HLD? : string;
    build_book? : string;
    access_document? : string;
    other? : string;
    other1? : string;
    other2? : string;
    other3? : string;
    attachements : any;
    rating? : ProjectRating;
    isLab? : boolean

    requiredRatingFiles : string[];
    hasFilesRatingConfig : boolean;
    letterUploaded? : boolean;
    finalRating? : number;
    providedRequiedFiles? : number;
}