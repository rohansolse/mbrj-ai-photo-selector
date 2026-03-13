import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel" style="padding: 18px;">
      <div class="muted">{{ label() }}</div>
      <div style="font-size: 2rem; font-weight: 700; margin-top: 8px;">{{ value() }}</div>
      <div class="muted" *ngIf="hint()">{{ hint() }}</div>
    </article>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>("");
}
