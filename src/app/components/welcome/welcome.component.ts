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
  viewChange = output<ViewType>();
  fullNameChange = output<string>();
  passwordChange = output<string>();

  inputFullName = signal('');
  inputPassword = signal('');

  canSubmit = computed(() => {
    return this.inputFullName() !== '' && this.inputPassword() !== '';
  });

  handleSubmit() {
    this.fullNameChange.emit(this.inputFullName());
    this.passwordChange.emit(this.inputPassword());
    this.viewChange.emit('test');
  }
}
