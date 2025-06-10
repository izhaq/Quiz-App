import {Component, ChangeDetectionStrategy, Input, input, computed} from '@angular/core';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import {Result} from "../../api/api";

export interface ViewResult {
  status: 'passed' | 'failed';
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
}

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [ProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './summary.component.html',
  styles: []
})
export class SummaryComponent {
  isLoading = input<boolean>(true);
  testResult = input.required<Result>();

  isPass = computed(() => this.testResult().score > 50);
} 