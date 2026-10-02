import { Company } from "./company.model";

export interface AuthResponse {
    token: string;
    id: string;
    fullName: string;
    email: string;
    roles: string[];
    image: string;
    department: string;
}