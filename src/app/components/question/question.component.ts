import {
  Component,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Question } from '../quiz/types';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './question.component.html',
  styles: [],
})
export class QuestionComponent {
  question = input.required<Question>();
  answerSelected = output<{ questionId: string; answerId: string }>();

  selectedAnswerId = signal('');

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
