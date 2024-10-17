import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpenAIService } from '../open-ai.service';

@Component({
  selector: 'app-system-prompt',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './system-prompt.component.html',
  styleUrl: './system-prompt.component.css'
})
export class SystemPromptComponent {
  systemPrompt = signal<string>('');
  private readonly openAIService = inject(OpenAIService);

  async updateSystemPrompt() {
    await this.openAIService.updateSystemPrompt(this.systemPrompt());
    alert('System prompt updated');
  }

}
