import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import {NavigationItem} from "../types";

export type QuestionState = 'visited' | 'current' | 'pending';

export interface QuestionPanelData {
  id: number;
  title: string;
  description: string;
  state: QuestionState;
}

@Component({
  selector: 'app-question-panel-item',
  standalone: true,
  imports: [],
  templateUrl: './question-panel-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionPanelItemComponent {
  @Input() navigationItem!: NavigationItem;
  @Input() questionNumber!: number;
  @Output() questionClick = new EventEmitter<string>();

  onQuestionClick(): void {
    if (this.navigationItem.state !== 'pending') {
      this.questionClick.emit(this.navigationItem.id);
    }
  }
} 