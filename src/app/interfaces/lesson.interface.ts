import { Question } from './question.interface';

export interface Lesson {
  id?: string; // optional, used when editing
  title: string;
  shortDescription: string;
  description: string; // HTML from Quill
  questions: Question[];
}
