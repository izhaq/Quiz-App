import questions from './questions.json';
import images from './images.json';
import { Question } from '../components/quiz/types';
import { Observable, of, delay } from 'rxjs';

export interface Image {
  id: string;
  url: string;
}

export interface Result {
  score: number;
  correctAnswers: number;
  totalAnswers: number;
}

export function getQuestions(): Observable<Question[]> {
  return of(questions).pipe(delay(2000));
}

export function getImages(): Observable<Image[]> {
  return of(images).pipe(delay(2000));
}

export function postResults(
  applicantId: string,
  applicantName: string,
  results: Array<{ questionId: string; answerId: string }>
): Observable<Result> {
  console.log('Posting results for', applicantId, applicantName, results);
  return of({
    score: Math.random() * 100,
    correctAnswers: 1,
    totalAnswers: 2,
  }).pipe(delay(3000));
}
