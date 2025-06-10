import {
  Component,
  signal,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '../../shared/components/checkbox/checkbox.component';
import { TimerDirective } from '../../shared/directives/timer/timer.directive';
import { ImageComponent } from '../../shared/components/image/image.component';
import { Question } from '../quiz/types';
import {Image} from "../../api/api";

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [FormsModule, CheckboxComponent, TimerDirective, ImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './question.component.html',
  styles: [],
})
export class QuestionComponent {
  question = input.required<Question>();
  answerId = input<string>();
  image = input<Image>({id: '', url: ''});
  currentQuestionNumber = input<number>();
  totalQuestions = input<number>();

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

  protected readonly Boolean = Boolean;
}
