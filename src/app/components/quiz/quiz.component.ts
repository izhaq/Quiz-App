import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
  computed, Signal, effect, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeComponent } from '../welcome/welcome.component';
import { QuestionComponent } from '../question/question.component';
import { SummaryComponent } from '../summary/summary.component';
import { QuestionSidePanelComponent } from '../question-side-panel/question-side-panel.component';
import { ViewType } from './types';
import { QuizService } from './quiz.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {NavigationItem, NavigationItemState} from "../question-side-panel/types";
import {TimerService} from "../../core/services/timer.service";
import {Image, Result} from "../../api/api";
import {tap} from "rxjs";

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    WelcomeComponent,
    QuestionComponent,
    SummaryComponent,
    QuestionSidePanelComponent,
  ],
  providers: [QuizService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quiz.component.html',
  styles: [],
})
export class QuizComponent implements OnInit{
  constructor() {
    this.initializeTimer();
  }

  private quizService = inject(QuizService);
  private timerService = inject(TimerService);

  currentView = signal<ViewType>('welcome');
  fullName = signal('');
  password = signal('');
  currentQuestionIndex = signal(0);
  currentViewedQuestionIndex = signal(0);
  answers = signal<Record<string, string>>({});
  questions = toSignal(this.quizService.loadQuestions(), { initialValue: [] });
  images = toSignal(this.quizService.loadImages(), { initialValue: [] });
  summaryResult = signal<Result>({score: 0, correctAnswers: 0, totalAnswers: 0});
  isLoadingSummaryResult = signal<boolean>(false);
  timeIsUp$ = this.timerService.timeUp$;

  logging: Signal<boolean> = computed(() => Boolean(this.fullName() && this.password()));

  // we will add the welcome and summary page navigation separately in order not to add them every time navigations recalculated
  navigations: Signal<NavigationItem[]> = computed(() => {
    return this.questions().map(({description, id}) => {

      let state: NavigationItemState = this.answers().hasOwnProperty(id) ? NavigationItemState.VISITED:
          this.logging() && this.currentQuestion().id === id ? NavigationItemState.CURRENT:
              NavigationItemState.PENDING

      return { 
        description,
        id,
        state: state,
        isActive: this.currentViewedQuestion().id === id,
      }
    })
  })



  //Todo - create a map of image-question for faster search
  currentViewQuestionImage: Signal<Image> = computed(() => {
    const image = this.images().find((image => this.currentViewedQuestion().imageId === image.id));
    return {
      id: this.currentViewedQuestion().id,
      url: image?.url ?? 'https://via.placeholder.com/256x192'
    }
  })

  currentViewedQuestion = computed(() => {
    return this.questions()[this.currentViewedQuestionIndex()] ?? null;
  })

  currentQuestion = computed(() => {
    console.log('current question is: ', this.currentQuestionIndex())
    return this.questions()[this.currentQuestionIndex()] ?? null;
  });

  hasMoreQuestions = computed(() => {
    const nextIndex = this.currentQuestionIndex() + 1;
    return nextIndex < this.questions().length;
  });

  currentViewedQuestionAnswerId = computed(() => {
    return this.answers()[this.currentViewedQuestion().id];
  });

  results = computed(() => {
    return Object.entries(this.answers()).map(([questionId, answerId]) => ({
      questionId,
      answerId,
    }));
  });

  ngOnInit() {
    this.timeIsUp$.subscribe(() => {
      this.handleAnswerOnTimeUp();
    })
  }

  setView(view: ViewType) {
    this.currentView.set(view);
    if (view === 'test' && this.questions().length > 0) {
      this.initializeFirstQuestion();
    }
  }

  private initializeTimer() {
    effect(() => {
      this.currentQuestionIndex();
      if(this.logging()) {
        this.timerService.reset(5);
      }
    })
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

  handleAnswerOnTimeUp() {
    this.updateAnswers(this.currentQuestion().id, '');
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
    this.currentViewedQuestionIndex.update((index) => index + 1);
  }

  private handleQuizCompletion() {
    this.isLoadingSummaryResult.update(() => true);
    this.currentView.set('summary');
    this.quizService
      .postResults(this.password(), this.fullName(), this.results())
      .subscribe({
        next: (response) => {
          this.summaryResult.set(response);
          this.isLoadingSummaryResult.update(() => false);
        },
      });
  }

  onQuestionSelected(questionId: string): void {
    const currentViewedQuestionIndex = this.questions().findIndex(question => question.id === questionId);
    if(this.currentView() !==  'test') {
      this.currentView.set('test')
    }
    this.currentViewedQuestionIndex.set(currentViewedQuestionIndex);
    // Handle navigation to selected question from side panel
    console.log('Navigate to question:', questionId);
    // TODO: Add navigation logic when side panel questions are clicked
  }
}
