import { Injectable, signal } from '@angular/core';
import { Question } from './types';
import { getQuestions, postResults } from '../../api/api';
import { Observable, tap, catchError, finalize, map } from 'rxjs';

@Injectable()
export class QuizService {
  error = signal<string | null>(null);
  isLoading = signal(false);

  loadQuestions(): Observable<Question[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return getQuestions().pipe(
      catchError((error) => {
        this.error.set('Failed to load questions: ' + error);
        throw error;
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  postResults(
    password: string,
    fullName: string,
    results: { questionId: string; answerId: string }[]
  ): Observable<void> {
    this.isLoading.set(true);
    this.error.set(null);

    return postResults(password, fullName, results).pipe(
      map(() => void 0),
      catchError((error) => {
        this.error.set('Failed to post results: ' + error);
        throw error;
      }),
      finalize(() => this.isLoading.set(false))
    );
  }
}
