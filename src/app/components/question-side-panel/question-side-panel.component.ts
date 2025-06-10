import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, input} from '@angular/core';
import { QuestionPanelItemComponent, QuestionPanelData } from './question-panel-item/question-panel-item.component';
import {Question} from "../quiz/types";
import {NavigationItem} from "./types";

@Component({
  selector: 'app-question-side-panel',
  standalone: true,
  imports: [QuestionPanelItemComponent],
  templateUrl: './question-side-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionSidePanelComponent {
  navigations = input.required<NavigationItem[]>()
  @Input() currentQuestionId: number = 1;
  @Output() questionSelected = new EventEmitter<string>();

  onQuestionClick(questionId: string): void {
    this.questionSelected.emit(questionId);
  }
} 