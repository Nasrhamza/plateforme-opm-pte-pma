import { Project } from "./project.model";
import { User } from "./user.model";

export interface ProjectRating {
    _id : string;
    Project : Project;
    managerToTeamLeaderRating : number;
    membersNotes : [{ 
        member : User,
        note : number
    }],
    memberToTeamLeaderRatings : [{ 
        member : User,
        note : number
    }]
}