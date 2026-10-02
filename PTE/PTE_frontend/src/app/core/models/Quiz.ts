import { Evaluation } from "./Evaluation";
import { Response } from "./Response";

export interface Quiz {
  _id: string;
  description: string;
  evaluation?: Evaluation;
  questions: {
    text: string;
    responses: Response[];
  }[];

}
