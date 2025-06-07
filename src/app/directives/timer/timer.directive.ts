import {
  Directive,
  ElementRef,
  Renderer2,
  input,
  output,
  effect,
  computed,
  inject,
  OnInit,
  OnDestroy,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { SharedTimerService } from './shared-timer.service';

@Directive({
  selector: '[appTimer]',
  standalone: true,
})
export class TimerDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private sharedTimer = inject(SharedTimerService);
  private injector = inject(Injector);

  // Inputs for directive configuration
  timerDuration = input<number>(30); // seconds
  timerAutoStart = input<boolean>(false);
  timerWarningThreshold = input<number | undefined>(undefined); // optional warning threshold

  // Outputs - emitted based on shared service state changes
  // We emit events when shared service state changes to maintain directive API
  timerTick = output<number>();
  timerComplete = output<void>();
  timerWarning = output<number>();

  // Local state for tracking previous values to detect changes
  private previousTimeLeft = 0;
  private previousWarningState = false;
  private previousCompleteState = false;

  // Computed properties that consume shared service signals
  timeLeft = computed(() => this.sharedTimer.timeLeft());
  running = computed(() => this.sharedTimer.running());
  warning = computed(() => this.sharedTimer.isWarning());
  complete = computed(() => this.sharedTimer.isComplete());
  formattedTime = computed(() => this.sharedTimer.formattedTime());

  constructor() {
    // Keep constructor clean - only dependency injection
  }

  ngOnInit() {
    // Register this directive instance with the shared service
    this.sharedTimer.registerInstance();
    
    // Configure the shared timer with this directive's inputs FIRST
    this.sharedTimer.configure(this.timerDuration(), this.timerWarningThreshold());
    
    // Initialize previous values with current state
    this.previousTimeLeft = this.timeLeft();
    this.previousWarningState = this.warning();
    this.previousCompleteState = this.complete();
    
    // NOW set up effects after proper configuration
    this.setupEffects();
    
    // Auto-start if requested
    if (this.timerAutoStart()) {
      this.start();
    }
  }

  private setupEffects() {
    // Use runInInjectionContext to create effects in ngOnInit
    runInInjectionContext(this.injector, () => {
      // Watch for time changes and emit tick events
      effect(() => {
        const currentTime = this.timeLeft();
        if (currentTime !== this.previousTimeLeft && this.running()) {
          this.previousTimeLeft = currentTime;
          // Emit tick events - Angular's change detection will handle performance optimization
          this.timerTick.emit(currentTime);
        }
      });

      // Watch for warning state changes
      effect(() => {
        const isWarning = this.warning();
        if (isWarning && !this.previousWarningState) {
          this.previousWarningState = true;
          // Emit warning - Angular's change detection will handle performance optimization
          this.timerWarning.emit(this.timeLeft());
        }
        // Reset warning flag when warning state ends
        if (!isWarning && this.previousWarningState) {
          this.previousWarningState = false;
        }
      });

      // Watch for completion
      effect(() => {
        const isComplete = this.complete();
        if (isComplete && !this.previousCompleteState) {
          this.previousCompleteState = true;
          // Emit completion - Angular's change detection will handle performance optimization
          this.timerComplete.emit();
        }
        // Reset completion flag when timer is reset
        if (!isComplete && this.previousCompleteState) {
          this.previousCompleteState = false;
        }
      });

      // Update DOM text content with formatted time from shared service
      effect(() => {
        const formatted = this.formattedTime();
        this.renderer.setProperty(this.elementRef.nativeElement, 'textContent', formatted);
      });
    });
  }

  ngOnDestroy() {
    // Unregister this directive instance (auto-cleanup happens in service)
    this.sharedTimer.unregisterInstance();
  }

  // Public methods that delegate to shared service
  start() {
    this.sharedTimer.start();
  }

  stop() {
    this.sharedTimer.stop();
  }

  pause() {
    this.sharedTimer.pause();
  }

  resume() {
    this.sharedTimer.resume();
  }

  reset() {
    this.sharedTimer.reset();
  }
} 