import { InternshipOffer } from "./InternshipOffer";
import { Quiz } from "./Quiz";

export interface Evaluation {
  _id: string;
  score: number;
  date: Date;
  internshipOffer: InternshipOffer;
  quiz: Quiz;
  
}
