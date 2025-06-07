import {
  Component,
  computed,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ViewType } from '../quiz/types';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './welcome.component.html',
  styles: [],
})
export class WelcomeComponent {
  viewChanged = output<ViewType>();
  fullNameChanged = output<string>();
  passwordChanged = output<string>();
  hardcoreModeChanged = output<boolean>();
  timePerQuestionChanged = output<number>();

  inputFullName = signal('');
  inputPassword = signal('');
  inputHardcoreMode = signal(false);
  inputTimePerQuestion = signal(30);

  canSubmit = computed(() => {
    return this.inputFullName() !== '' && this.inputPassword() !== '';
  });

  onHardcoreModeChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.inputHardcoreMode.set(checkbox.checked);
    this.hardcoreModeChanged.emit(checkbox.checked);
  }

  onTimePerQuestionChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const seconds = parseInt(select.value, 10);
    this.inputTimePerQuestion.set(seconds);
    this.timePerQuestionChanged.emit(seconds);
  }

  handleSubmit() {
    this.fullNameChanged.emit(this.inputFullName());
    this.passwordChanged.emit(this.inputPassword());
    this.hardcoreModeChanged.emit(this.inputHardcoreMode());
    this.timePerQuestionChanged.emit(this.inputTimePerQuestion());
    this.viewChanged.emit('test');
  }
}
