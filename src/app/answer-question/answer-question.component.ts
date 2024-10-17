import { Component, inject, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpenAIService } from '../open-ai.service';
import { MarkdownModule } from 'ngx-markdown';
import { Router } from '@angular/router';

@Component({
  selector: 'app-answer-question',
  standalone: true,
  imports: [FormsModule, MarkdownModule],
  templateUrl: './answer-question.component.html',
  styleUrl: './answer-question.component.css'
})
export class AnswerQuestionComponent {
  question = signal('');
  conversation = signal<string[]>([]);

  private readonly openAIService = inject(OpenAIService);
  private readonly router = inject(Router);

  async answerQuestion() {
    await this.openAIService.answerQuestion(this.question());
    this.conversation.set(this.openAIService.conversation);
    console.log(this.conversation()[this.conversation().length - 1]);
    if (this.conversation()[this.conversation().length - 1].includes('{') && this.conversation()[this.conversation().length - 1].includes('}')) {
      console.log('JSON object detected');
      this.router.navigate(['/order-summary']);
    }
  }

  startOver() {
    this.openAIService.conversation = [];
    this.conversation.set([]);
  }
}
