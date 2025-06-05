import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './summary.component.html',
  styles: []
})
export class SummaryComponent {} 