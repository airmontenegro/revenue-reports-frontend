import { Answer } from './answer.interface';

export interface Question {
  id?: string; // optional, used when editing
  questionText: string;
  answers: Answer[];
}