import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { QuizComponent } from './components/quiz/quiz.component';
import { appConfig } from './app.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [QuizComponent],
  template: `
    <main>
      <app-quiz></app-quiz>
    </main>
  `,
  styles: [],
})
export class AppComponent {
  title = 'quiz-form-angular';
}
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
