import { User } from "./user.model";

export interface EventModel {
    _id : string
    title: string;
    category? : string;
    details? : string;
    startDate : Date;
    endDate : Date;
    color? : string
    user? : User;
}