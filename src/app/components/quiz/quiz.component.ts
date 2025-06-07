import { Component, OnDestroy, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { WelcomeComponent } from '../welcome/welcome.component';
import { QuestionComponent } from '../question/question.component';
import { SummaryComponent } from '../summary/summary.component';
import { QuizService } from './quiz.service';
import { TimerDirective, SharedTimerService } from '../../directives/timer';

type ViewType = 'welcome' | 'test' | 'summary';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    WelcomeComponent,
    QuestionComponent,
    SummaryComponent,
    TimerDirective,
  ],
  providers: [QuizService],
  templateUrl: './quiz.component.html',
  styles: [`
    /* Timer directive styling */
    .timer-warning {
      --timer-color: #dc2626 !important;
      animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
    
    /* Default timer color for non-warning state */
    [appTimer]:not(.timer-warning) {
      --timer-color: #2563eb;
    }
  `],
})
export class QuizComponent implements OnDestroy {
  private quizService = inject(QuizService);
  private sharedTimer = inject(SharedTimerService);

  // Expose Math for template
  readonly Math = Math;

  currentView = signal<ViewType>('welcome');
  fullName = signal('');
  password = signal('');
  hardcoreMode = signal(false);
  quizPassed = signal(true);
  currentQuestionIndex = signal(0);
  answers = signal<Record<string, string>>({});
  timePerQuestion = signal(30); // 30 seconds per question
  isTimerWarning = signal(false); // Track timer warning state
  questions = toSignal(this.quizService.loadQuestions(), { initialValue: [] });

  currentQuestion = computed(() => {
    return this.questions()[this.currentQuestionIndex()] ?? null;
  });

  hasMoreQuestions = computed(() => {
    const nextIndex = this.currentQuestionIndex() + 1;
    return nextIndex < this.questions().length;
  });

  progress = computed(() => {
    const current = this.currentQuestionIndex() + 1;
    const total = this.questions().length;
    return {
      text: `Question ${current} of ${total}`,
      percentage: Math.round((current / total) * 100)
    };
  });

  score = computed(() => {
    const totalQuestions = this.questions().length;
    const correctAnswers = Object.entries(this.answers()).filter(([questionId, answerId]) => {
      const question = this.questions().find(q => q.id === questionId);
      return question && question.correctAnswerId === answerId;
    }).length;
    
    return {
      correct: correctAnswers,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    };
  });

  results = computed(() => {
    return Object.entries(this.answers()).map(([questionId, answerId]) => ({
      questionId,
      answerId,
    }));
  });

  getQuestionStatus(index: number): string {
    const currentIndex = this.currentQuestionIndex();
    const questionId = this.questions()[index]?.id;
    const hasAnswer = questionId && this.answers()[questionId];

    if (index === currentIndex) {
      return 'bg-blue-600 text-white'; // Current question
    } else if (index < currentIndex || hasAnswer) {
      return 'bg-green-500 text-white'; // Answered
    } else {
      return 'bg-gray-300 text-gray-700'; // Not answered yet
    }
  }

  setView(view: ViewType) {
    this.currentView.set(view);
    if (view === 'test' && this.questions().length > 0) {
      this.initializeFirstQuestion();
      this.quizPassed.set(true);
    }
  }

  private initializeFirstQuestion() {
    this.currentQuestionIndex.set(0);
    
    // Preload first and second question images
    this.preloadCurrentAndNextImages();
  }

  private preloadCurrentAndNextImages() {
    const questions = this.questions();
    const currentIndex = this.currentQuestionIndex();
    
    // Preload current question image
    if (currentIndex < questions.length) {
      const currentQuestion = questions[currentIndex];
      if (currentQuestion.imageId) {
        const imageUrl = `https://picsum.photos/600/300?random=${currentQuestion.imageId.replace('img', '')}`;
        const img = new Image();
        img.src = imageUrl;
      }
    }
    
    // Preload next question image
    this.preloadNextImage();
  }

  // Timer event handlers
  onTimerWarning(timeLeft: number) {
    this.isTimerWarning.set(true);
    console.log(`Warning: ${timeLeft} seconds remaining`);
  }

  onTimerComplete() {
    // Reset warning state when timer completes
    this.isTimerWarning.set(false);
    
    // Auto-submit when time runs out
    const currentQuestion = this.currentQuestion();
    if (currentQuestion) {
      // Submit with no answer (empty string)
      this.handleAnswer(currentQuestion.id, '');
    }
  }

  setFullName(name: string) {
    this.fullName.set(name);
  }

  setPassword(password: string) {
    this.password.set(password);
  }

  setHardcoreMode(isHardcore: boolean) {
    this.hardcoreMode.set(isHardcore);
  }

  setTimePerQuestion(seconds: number) {
    this.timePerQuestion.set(seconds);
  }

  handleAnswer(questionId: string, answerId: string) {
    // Check if answer is wrong in hardcore mode
    if (this.hardcoreMode() && answerId) {
      const question = this.questions().find(q => q.id === questionId);
      if (question && question.correctAnswerId !== answerId) {
        // Wrong answer in hardcore mode - end quiz immediately
        this.updateAnswers(questionId, answerId);
        this.quizPassed.set(false);
        this.currentView.set('summary');
        return;
      }
    }
    
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
    this.currentQuestionIndex.update(i => i + 1);
    
    // Reset warning state for new question
    this.isTimerWarning.set(false);
    
    // Reset and restart timer for the new question
    this.sharedTimer.reset();
    this.sharedTimer.start();
    
    // Preload next question's image if available
    this.preloadNextImage();
  }

  private preloadNextImage() {
    const nextIndex = this.currentQuestionIndex() + 1;
    const questions = this.questions();
    if (nextIndex < questions.length) {
      const nextQuestion = questions[nextIndex];
      if (nextQuestion.imageId) {
        const imageUrl = `https://picsum.photos/600/300?random=${nextQuestion.imageId.replace('img', '')}`;
        const img = new Image();
        img.src = imageUrl; // This starts preloading
      }
    }
  }

  private handleQuizCompletion() {
    // Calculate if passed (70% or higher)
    const percentage = this.score().percentage;
    this.quizPassed.set(percentage >= 70);
    this.currentView.set('summary');
  }

  ngOnDestroy() {
    // Timer cleanup is now handled by the directive automatically
  }
}
