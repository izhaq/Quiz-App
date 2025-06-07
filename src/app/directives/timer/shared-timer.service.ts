import { Injectable, signal, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SharedTimerService {
  private destroyRef = inject(DestroyRef);
  
  // Shared state - single source of truth for all timer instances
  private remainingTime = signal(0);
  private isRunning = signal(false);
  private duration = signal(30);
  private warningThreshold = signal<number | undefined>(undefined);
  private hasWarned = signal(false);
  
  // Reference counting to track active directive instances
  private activeInstances = signal(0);
  
  // Public readonly signals for directive consumption
  readonly timeLeft = this.remainingTime.asReadonly();
  readonly running = this.isRunning.asReadonly();
  readonly currentDuration = this.duration.asReadonly();
  
  // Computed states
  readonly isWarning = computed(() => {
    const threshold = this.warningThreshold();
    return threshold !== undefined && 
           this.remainingTime() <= threshold && 
           this.remainingTime() > 0;
  });
  
  readonly isComplete = computed(() => this.remainingTime() === 0);
  
  readonly formattedTime = computed(() => {
    const time = this.remainingTime();
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  // Instance management
  registerInstance(): void {
    this.activeInstances.update(count => count + 1);
  }
  
  unregisterInstance(): void {
    this.activeInstances.update(count => {
      const newCount = Math.max(0, count - 1);
      // Auto-cleanup: stop timer when no instances are active
      if (newCount === 0) {
        this.stop();
      }
      return newCount;
    });
  }
  
  // Timer configuration
  configure(durationSeconds: number, warningThresholdSeconds?: number): void {
    // Only allow reconfiguration when timer is not running
    if (!this.isRunning()) {
      this.duration.set(durationSeconds);
      this.warningThreshold.set(warningThresholdSeconds);
      this.remainingTime.set(durationSeconds);
      this.hasWarned.set(false);
    }
  }
  
  // Timer control methods
  start(): void {
    if (this.isRunning()) return;
    
    this.isRunning.set(true);
    
    interval(1000)
      .pipe(
        takeWhile(() => this.isRunning() && this.remainingTime() > 0),
        map(() => this.remainingTime() - 1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((newTime: number) => {
        this.remainingTime.set(Math.max(0, newTime));
        
        // Check for warning state
        if (this.isWarning() && !this.hasWarned()) {
          this.hasWarned.set(true);
        }
        
        // Auto-stop when complete
        if (newTime <= 0) {
          this.stop();
        }
      });
  }
  
  stop(): void {
    this.isRunning.set(false);
  }
  
  pause(): void {
    this.stop();
  }
  
  resume(): void {
    if (this.remainingTime() > 0) {
      this.start();
    }
  }
  
  reset(): void {
    this.stop();
    this.remainingTime.set(this.duration());
    this.hasWarned.set(false);
  }
  
  // State getters for external access
  get warningState(): boolean {
    return this.isWarning();
  }
  
  get completeState(): boolean {
    return this.isComplete();
  }
  
  get hasWarnedState(): boolean {
    return this.hasWarned();
  }
} 