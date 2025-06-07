import { Component, ChangeDetectionStrategy, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../quiz/types';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './summary.component.html',
  styles: []
})
export class SummaryComponent {
  fullName = input<string>('');
  score = input<{ correct: number; total: number; percentage: number }>({ correct: 0, total: 0, percentage: 0 });
  quizPassed = input<boolean>(false);
  hardcoreMode = input<boolean>(false);
  results = input<Array<{ questionId: string; answerId: string }>>([]);
  questions = input<Question[]>([]);
  
  restartQuiz = output<void>();

  // Compute detailed results for each question
  detailedResults = computed(() => {
    const questionsData = this.questions();
    const userResults = this.results();
    
    return questionsData.map(question => {
      const userAnswer = userResults.find(r => r.questionId === question.id);
      const selectedAnswer = question.answers.find(a => a.id === userAnswer?.answerId);
      const correctAnswer = question.answers.find(a => a.id === question.correctAnswerId);
      const isCorrect = userAnswer?.answerId === question.correctAnswerId;
      
      return {
        question,
        selectedAnswer: selectedAnswer || null,
        correctAnswer,
        isCorrect,
        wasAnswered: !!userAnswer?.answerId
      };
    });
  });

  congratulationsMessage = computed(() => {
    const percentage = this.score().percentage;
    const passed = this.quizPassed();
    const hardcore = this.hardcoreMode();
    
    if (hardcore && !passed) {
      return "Don't worry! Hardcore mode is tough. Try again!";
    }
    
    if (passed && percentage >= 90) {
      return "Outstanding! You're an Angular expert!";
    } else if (passed && percentage >= 80) {
      return "Great job! You have solid Angular knowledge!";
    } else if (passed) {
      return "Well done! You passed the quiz!";
    } else {
      return "Keep learning! You'll get it next time!";
    }
  });

  getAnswerClass(answerId: string, result: any): string {
    const isCorrectAnswer = answerId === result.question.correctAnswerId;
    const isUserAnswer = result.selectedAnswer?.id === answerId;
    
    if (isCorrectAnswer) {
      return 'bg-green-100 border-green-200 text-green-800'; // Correct answer
    } else if (isUserAnswer && !result.isCorrect) {
      return 'bg-red-100 border-red-200 text-red-800'; // Wrong user answer
    } else {
      return 'bg-gray-50 border-gray-200 text-gray-600'; // Other answers
    }
  }

  onRestartQuiz() {
    this.restartQuiz.emit();
  }
} 