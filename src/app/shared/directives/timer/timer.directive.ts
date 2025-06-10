import { Directive, ElementRef, OnInit, OnDestroy, effect, inject, input } from '@angular/core';
import { TimerService } from '../../../core/services/timer.service';

@Directive({
  selector: '[appTimer]',
  standalone: true
})
export class TimerDirective implements OnInit, OnDestroy {
  private timerService = inject(TimerService);
  private elementRef = inject(ElementRef);

  // Input for timer duration in seconds
  duration = input(0, {
    alias: 'appTimer',
    transform: (value: string | number | null | undefined): number => {
      if (value === null || value === undefined || value === '') {
        return 30;
      }
      if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 30 : parsed;
      }
      return value;
    }
  });

  constructor() {
    // Effect to update the display when timer changes
    effect(() => {
      const timeLeft = this.timerService.timeLeft();
      this.elementRef.nativeElement.textContent = this.formatTime(timeLeft);
    });
  }

  ngOnInit(): void {
    // Start the timer with the specified duration
    //this.timerService.reset(this.duration());
  }

  ngOnDestroy(): void {
    // Stop the timer when directive is destroyed
    this.timerService.stop();
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
} 