import { Company } from "./company.model";
import { User } from "./user.model";

export interface LeaveRequest {
    _id : string
    user : User,
    company : Company;
    startDate : Date,
    endDate : Date,
    status : 'APPROVED' | 'PENDING',
    comment? : string
}