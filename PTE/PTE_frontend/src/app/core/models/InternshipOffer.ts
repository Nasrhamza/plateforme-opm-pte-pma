import { User } from "./user";

export interface InternshipOffer {
  _id?: string;
  title: string;
  description: string;
  technologies: string;
  encadrant?: User; 
  internsNumber?: number; 
  period?:number; 
  expirationDate?: Date; 
  departement?: string; 


 
}
