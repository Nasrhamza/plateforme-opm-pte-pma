import { InternshipOffer } from "./InternshipOffer";
import { User } from "./user";



export interface Task {
  _id?: string;
  description: string;
  title: string;
  startDate: Date;
  endDate: Date;
  closedAt: Date;
  internshipOffer?: string;
  status?: string;
  priority?: string;
  assignedTo?: string[];
  progress?:number;
}
