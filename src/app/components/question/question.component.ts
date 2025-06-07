import {
  Component,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Question } from '../quiz/types';
import { TimerDirective } from '../../directives/timer';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [FormsModule, CommonModule, TimerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './question.component.html',
  styles: [`
    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .timer-urgent {
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

    .image-container {
      position: relative;
      overflow: hidden;
    }

    .image-loading {
      opacity: 0.3;
      transition: opacity 0.3s ease;
    }

    .image-loaded {
      opacity: 1;
      transition: opacity 0.3s ease;
    }

    .image-placeholder {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    /* Question timer warning styling */
    .question-timer.timer-warning {
      background-color: #fecaca !important;
      color: #dc2626 !important;
      animation: pulse 1s infinite;
    }
  `],
})
export class QuestionComponent {
  question = input.required<Question>();
  questionNumber = input<number>(1);
  totalQuestions = input<number>(10);
  hardcoreMode = input<boolean>(false);
  
  answerSelected = output<{ questionId: string; answerId: string }>();

  selectedAnswerId = signal('');
  imageLoading = signal(true);
  currentImageUrl = signal<string | null>(null);

  // Generate image URL based on imageId
  imageUrl = computed(() => {
    const imageId = this.question().imageId;
    if (imageId) {
      // Using a placeholder service for demo - in real app you'd have actual images
      return `https://picsum.photos/600/300?random=${imageId.replace('img', '')}`;
    }
    return null;
  });

  constructor() {
    // Watch for image URL changes and handle loading state
    effect(() => {
      const newImageUrl = this.imageUrl();
      if (newImageUrl && newImageUrl !== this.currentImageUrl()) {
        this.imageLoading.set(true);
        // Preload the image
        const img = new Image();
        img.onload = () => {
          this.currentImageUrl.set(newImageUrl);
          this.imageLoading.set(false);
        };
        img.onerror = () => {
          this.imageLoading.set(false);
        };
        img.src = newImageUrl;
      } else if (!newImageUrl) {
        this.currentImageUrl.set(null);
        this.imageLoading.set(false);
      }
    });
  }

  onImageLoad() {
    this.imageLoading.set(false);
  }

  onImageError() {
    this.imageLoading.set(false);
  }

  handleAnswerSelectionOption(answerId: string) {
    if (this.selectedAnswerId() === answerId) {
      this.selectedAnswerId.set('');
    } else {
      this.selectedAnswerId.set(answerId);
    }
  }

  handleNext() {
    if (this.selectedAnswerId()) {
      this.answerSelected.emit({
        questionId: this.question().id,
        answerId: this.selectedAnswerId(),
      });
      this.selectedAnswerId.set('');
    }
  }
}
