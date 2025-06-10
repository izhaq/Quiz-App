import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './checkbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {
  @Input() isChecked: boolean = false;
  @Input() isDisabled: boolean = false;
  @Output() selectionChange = new EventEmitter<void>();

  onSelectionChange(): void {
    if (!this.isDisabled) {
      this.selectionChange.emit();
    }
  }
} 