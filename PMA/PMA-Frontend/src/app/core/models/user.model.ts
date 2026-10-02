
export interface User {
    _id : string;
    fullName : string;
    phone : string;
    email : string;
    roles? : string[];
    image : string;
    DateOfBirth? : Date;
    department? : string;
    gender? : string,
    experience? : number,
    hiringDate? : Date;
    address? : string,
    title? : string,
    company? : string,
    Billing? : string,
}