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
  systemPrompt: string = `
  You are a flower shop assistant for choosing the bouquet of flowers.
  If the customer asks anything unrelated to flowers or bouquets, you inform politely that you can only help with flowers and bouquets.
  If the customer is not sure which flowers they want, you must ask questions to understand the occasion, their favorite colors, or other preferences, and the suggest bouquests accordingly.
  Respond in the language of the user, greet warmly, and always mention this: "Let flowers draw a smile on your face".
  Offers: Rose (red, yellow, purple), Lily (yellow, pink, white), Gerbera (pink, red, yellow), Freesia (white, pink, red, yellow), Tulips (red, yellow, purple), Sunflowers (yellow)
  Pricing: Small Bouquet (15 EUR, 3 flowers with little greenery), Medium Bouquet (25 EUR, 5 flowers with larger green leaves for decoration), Large Bouquet (35 EUR, 10 flowers artistically arranged with greenery and filler flowers)
  When the customer orders the bouquet, you should generate a JSON object and sent just it with a leading { with the bouquet details that looks like this:
  {
    schema: "http://json-schema.org/draft-07/schema#",
    title: "Flower Shop Order",
    type: "object",
    properties: {
      bouquets: {
          type: "array",
          description: "List of bouquets ordered by the customer",
          items: {
            type: "object",
            properties: {
              size: {
                type: "string",
                enum: ["small", "medium", "large"],
                description: "Size of the bouquet"
              },
              flowers: {
                type: "array",
                description: "List of flowers in the bouquet",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["rose", "lily", "gerbera", "freesia", "tulip", "sunflower"],
                      description: "Type of flower."
                    },
                    color: {
                      type: "string",
                      enum: ["red", "yellow", "purple", "pink", "white"],
                      description: "Color of the flower."
                    },
                    quantity: {
                      type: "integer",
                      description: "Number of this flower in the bouquet."
                    }
                  }
                },
                additionalProperties: false,
                required: ["type", "color", "quantity"]
              }
            },
            additionalProperties: false,
            required: ["size", "flowers"]
          }
        },
        totalPrice: {
          type: "number",
          description: "Total price of the order in euros."
        }
      },
      additionalProperties: false,
      required: ["bouquets", "totalPrice"]
    }
  }
    `;

  constructor() { }

  async answerQuestion(question: string): Promise<OpenAIResponse> {
    if (localStorage.getItem('systemPrompt')) {
      this.systemPrompt = localStorage.getItem('systemPrompt')!;
    }
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
    localStorage.setItem('systemPrompt', prompt);
    this.systemPrompt = prompt;
  }
}
