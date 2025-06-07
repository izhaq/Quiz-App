import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { Question } from './types';
import { getQuestions } from '../../api/api';

@Injectable()
export class QuizService {
  error = signal<string | null>(null);
  isLoading = signal(false);

  loadQuestions(): Observable<Question[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return getQuestions().pipe(
      map(questions => questions.sort((a, b) => a.priority - b.priority)),
      catchError((error) => {
        this.error.set('Failed to load questions: ' + error);
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  postResults(
    password: string,
    fullName: string,
    results: Array<{ questionId: string; answerId: string }>
  ): Observable<any> {
    // Simulate API call
    console.log('Submitting results:', { password, fullName, results });
    return new Observable((observer) => {
      setTimeout(() => {
        observer.next({ success: true });
        observer.complete();
      }, 1000);
    });
  }
}
