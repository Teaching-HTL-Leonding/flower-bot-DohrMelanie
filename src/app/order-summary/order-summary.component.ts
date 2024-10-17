import { Component, computed, inject, signal } from '@angular/core';
import { OpenAIService } from '../open-ai.service';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {
  private readonly openAIService = inject(OpenAIService);

  order = computed(() => {
    return JSON.parse(
      this.openAIService.conversation[this.openAIService.conversation.length - 1]
      .replace(/^[^{]+/, '')
      .replace(/[^}]+$/, '')
    );
  });

  ngOnInit() {
    console.log(this.order());
  }
}
