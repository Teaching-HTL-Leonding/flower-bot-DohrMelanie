import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type OpenAIResponse = {
  choices: {
    message: {
      role: string;
      content: string;
    }
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private httpClient = inject(HttpClient);
  conversation: string[] = [];
  systemPrompt: string = 'Answer sarcasticly and slightly insulting' //like a pirate parrot 🦜🏴‍☠️',

  constructor() { }

  async answerQuestion(question: string): Promise<OpenAIResponse> {
    console.log(this.systemPrompt);
    if (question.length === 0) {
      return {
        choices: [
          {
            message: {
              role: 'system',
              content: 'Please ask a question first.'
            }
          }
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
    }
    this.conversation.push(question);
    let answer: OpenAIResponse = await firstValueFrom(
      this.httpClient.post<OpenAIResponse>(
        'http://localhost:3000/openai/deployments/gpt-4o-mini/chat/completions', {
          messages: [
            {
              role: 'system',
              content: this.systemPrompt,
            },
            {
              role: 'user',
              content: this.conversation.join('\n'),
            }
          ]
        }
      )
    );
    this.conversation.push(answer.choices[0].message.content);
    return answer;
  }

  async updateSystemPrompt(prompt: string): Promise<void> {
    this.systemPrompt = prompt;
  }
}
