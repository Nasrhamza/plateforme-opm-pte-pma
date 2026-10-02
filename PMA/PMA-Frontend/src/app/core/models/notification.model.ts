import { User } from "./user.model";

export interface Notification {
    _id : string;
    title : string;
    details? : string;
    recepient? : string;
    entityId : string;
    entityType : string;
    emitter? : User;
    status : string;
    createdAt? : Date
}