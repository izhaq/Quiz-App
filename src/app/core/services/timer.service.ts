import { Injectable, signal, OnDestroy, Signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService implements OnDestroy {
  // Private signals to hold the state
  private _remainingTime = signal(0);
  private _isRunning = signal(false);

  // Private subject for the "time's up" event
  private timeUpSubject = new Subject<{}>();

  // The interval ID for cleanup
  private intervalId: any = null;

  /** Public, read-only signal for components to display the time. */
  public readonly timeLeft: Signal<number> = this._remainingTime.asReadonly();

  /** Public, read-only signal to know if the timer is active. */
  public readonly isRunning: Signal<boolean> = this._isRunning.asReadonly();

  /** Public observable for components to react when the timer hits zero. */
  public readonly timeUp$: Observable<{}> = this.timeUpSubject.asObservable();

  constructor() { }

  /**
   * Stops the current timer and starts a new one with the given duration.
   * This is the main method components will use.
   *
   * @param newDuration The duration for the new countdown in seconds.
   */
  public reset(newDuration: number): void {
    // Stop any previously running timer
    this.stop();

    // Set the initial state and start the interval
    this._remainingTime.set(newDuration);
    this._isRunning.set(true);

    this.intervalId = setInterval(() => {
      this._remainingTime.update(value => value - 1);

      if (this._remainingTime() <= 0) {
        this.stop(); // Stop the interval
        this.timeUpSubject.next({}); // Announce that time is up
      }
    }, 1000);
  }

  /**
   * Stops and clears the timer.
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this._isRunning.set(false);
  }

  /**
   * Cleans up the interval when the service is destroyed to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.stop();
  }
}