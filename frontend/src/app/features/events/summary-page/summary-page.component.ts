import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";

import { EventService } from "../../../core/services/event.service";
import { EventSummary } from "../../../core/models/types";
import { StatCardComponent } from "../../../shared/components/stat-card/stat-card.component";

@Component({
  selector: "app-summary-page",
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  template: `
    <section class="section page-header panel">
      <div class="stack">
        <span class="badge">Summary dashboard</span>
        <h1 class="hero-title">{{ summary()?.event_name || "Event overview" }}</h1>
        <p class="hero-subtitle">Uploaded, shortlisted, rejected, and duplicate counts in one place.</p>
      </div>
      <div class="actions" style="align-items: start;">
        <a class="btn btn-secondary" [routerLink]="['/events', eventId(), 'upload']">Upload</a>
        <a class="btn btn-primary" [routerLink]="['/events', eventId(), 'final-selection']">Final selection</a>
      </div>
    </section>

    <section class="section stats-grid">
      <app-stat-card label="Total Uploaded" [value]="summary()?.total_uploaded || 0" />
      <app-stat-card label="Shortlisted" [value]="summary()?.shortlisted_count || 0" />
      <app-stat-card label="Rejected" [value]="summary()?.rejected_count || 0" />
      <app-stat-card label="Duplicate Groups" [value]="summary()?.duplicate_groups_count || 0" />
      <app-stat-card label="Average Score" [value]="summary()?.average_score || 0" />
      <app-stat-card label="Top Score" [value]="summary()?.top_score || 0" />
    </section>

    <section class="section panel" style="padding: 24px;" *ngIf="summary()?.score_distribution as dist">
      <div class="stack">
        <h2 style="margin: 0;">Score Distribution</h2>
        <div class="stats-grid">
          <app-stat-card label="< 50" [value]="dist['under50'] || 0" />
          <app-stat-card label="50-69" [value]="dist['fiftyToSeventy'] || 0" />
          <app-stat-card label="70-84" [value]="dist['seventyToEightyFive'] || 0" />
          <app-stat-card label="85+" [value]="dist['eightyFivePlus'] || 0" />
        </div>
      </div>
    </section>
  `,
})
export class SummaryPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  protected readonly eventId = signal(this.route.snapshot.paramMap.get("eventId") || "");
  protected readonly summary = signal<EventSummary | null>(null);

  ngOnInit() {
    this.eventService.getSummary(this.eventId()).subscribe((summary) => this.summary.set(summary));
  }
}
