import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeComponent } from '../welcome/welcome.component';
import { QuestionComponent } from '../question/question.component';
import { SummaryComponent } from '../summary/summary.component';
import { ViewType } from './types';
import { QuizService } from './quiz.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    WelcomeComponent,
    QuestionComponent,
    SummaryComponent,
  ],
  providers: [QuizService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quiz.component.html',
  styles: [],
})
export class QuizComponent {
  private quizService = inject(QuizService);

  currentView = signal<ViewType>('welcome');
  fullName = signal('');
  password = signal('');
  currentQuestionIndex = signal(0);
  answers = signal<Record<string, string>>({});
  questions = toSignal(this.quizService.loadQuestions(), { initialValue: [] });

  currentQuestion = computed(() => {
    return this.questions()[this.currentQuestionIndex()] ?? null;
  });

  hasMoreQuestions = computed(() => {
    const nextIndex = this.currentQuestionIndex() + 1;
    return nextIndex < this.questions().length;
  });

  results = computed(() => {
    return Object.entries(this.answers()).map(([questionId, answerId]) => ({
      questionId,
      answerId,
    }));
  });

  setView(view: ViewType) {
    this.currentView.set(view);
    if (view === 'test' && this.questions().length > 0) {
      this.initializeFirstQuestion();
    }
  }

  private initializeFirstQuestion() {
    this.currentQuestionIndex.set(0);
  }

  setFullName(name: string) {
    this.fullName.set(name);
  }

  setPassword(password: string) {
    this.password.set(password);
  }

  handleAnswer(questionId: string, answerId: string) {
    this.updateAnswers(questionId, answerId);
    this.handleNextQuestionOrSummary();
  }

  private updateAnswers(questionId: string, answerId: string) {
    this.answers.set({
      ...this.answers(),
      [questionId]: answerId,
    });
  }

  private handleNextQuestionOrSummary() {
    if (this.hasMoreQuestions()) {
      this.moveToNextQuestion();
    } else {
      this.handleQuizCompletion();
    }
  }

  private moveToNextQuestion() {
    this.currentQuestionIndex.update((index) => index + 1);
  }

  private handleQuizCompletion() {
    this.quizService
      .postResults(this.password(), this.fullName(), this.results())
      .subscribe({
        next: () => this.currentView.set('summary'),
      });
  }
}
