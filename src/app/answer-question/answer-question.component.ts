import { Component, inject, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpenAIService } from '../open-ai.service';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-answer-question',
  standalone: true,
  imports: [FormsModule, MarkdownModule],
  templateUrl: './answer-question.component.html',
  styleUrl: './answer-question.component.css'
})
export class AnswerQuestionComponent {
  answer = signal('');
  question = signal('');

  private readonly openAIService = inject(OpenAIService);

  async answerQuestion() {
    const response = await this.openAIService.answerQuestion(this.question());
    this.answer.set(response.choices[0].message.content);
  }
}
