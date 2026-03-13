import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Subscription, interval, switchMap } from "rxjs";

import { EventService } from "../../../core/services/event.service";
import { EventSummary } from "../../../core/models/types";
import { StatCardComponent } from "../../../shared/components/stat-card/stat-card.component";

@Component({
  selector: "app-processing-status-page",
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  template: `
    <section class="section page-header panel">
      <div class="stack">
        <span class="badge">Processing</span>
        <h1 class="hero-title">Track scoring and shortlist progress.</h1>
        <p class="hero-subtitle">Uploads return immediately; background jobs continue local analysis and status transitions.</p>
      </div>
      <div class="actions" style="align-items: start;">
        <a class="btn btn-primary" [routerLink]="['/events', eventId(), 'shortlist']">Open shortlist</a>
        <a class="btn btn-secondary" [routerLink]="['/events', eventId(), 'duplicates']">Review duplicates</a>
      </div>
    </section>

    <section class="section stats-grid">
      <app-stat-card label="Uploaded" [value]="summary()?.total_uploaded || 0" />
      <app-stat-card label="Shortlisted" [value]="summary()?.shortlisted_count || 0" />
      <app-stat-card label="Rejected" [value]="summary()?.rejected_count || 0" />
      <app-stat-card label="Duplicate Groups" [value]="summary()?.duplicate_groups_count || 0" />
    </section>
  `,
})
export class ProcessingStatusPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  protected readonly eventId = signal(this.route.snapshot.paramMap.get("eventId") || "");
  protected readonly summary = signal<EventSummary | null>(null);

  private subscription?: Subscription;

  ngOnInit() {
    this.subscription = interval(4000)
      .pipe(switchMap(() => this.eventService.getSummary(this.eventId())))
      .subscribe((summary) => this.summary.set(summary));

    this.eventService.getSummary(this.eventId()).subscribe((summary) => this.summary.set(summary));
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
