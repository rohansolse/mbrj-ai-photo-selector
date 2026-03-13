import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";

import { EventService } from "../../../core/services/event.service";
import { EventItem } from "../../../core/models/types";

@Component({
  selector: "app-event-list-page",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="section page-header panel">
      <div class="stack">
        <span class="badge">Offline-first AI culling</span>
        <h1 class="hero-title">Wedding and event album selection without cloud vision APIs.</h1>
        <p class="hero-subtitle">
          Upload a full shoot, run local scoring, isolate burst groups, and keep the strongest frames for manual review.
        </p>
      </div>
      <div class="stack">
        <div class="panel" style="padding: 20px; background: rgba(255,255,255,0.65);">
          <strong>Pipeline</strong>
          <div class="muted">Upload -> analyze -> deduplicate -> shortlist -> final select</div>
        </div>
        <div class="actions">
          <a class="btn btn-primary" routerLink="/events/new">Create Event</a>
        </div>
      </div>
    </section>

    <section class="section stack">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0;">Events</h2>
        <span class="muted">{{ events().length }} total</span>
      </div>

      <div class="gallery-grid">
        <article class="panel" style="padding: 20px;" *ngFor="let event of events()">
          <div class="stack">
            <div>
              <strong>{{ event.event_name }}</strong>
              <div class="muted">{{ event.event_type }} · {{ event.total_photos || 0 }} photos</div>
            </div>
            <div class="actions">
              <a class="btn btn-secondary" [routerLink]="['/events', event.id, 'upload']">Upload</a>
              <a class="btn btn-secondary" [routerLink]="['/events', event.id, 'summary']">Summary</a>
              <a class="btn btn-primary" [routerLink]="['/events', event.id, 'shortlist']">Review</a>
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
})
export class EventListPageComponent implements OnInit {
  private readonly eventService = inject(EventService);

  protected readonly events = signal<EventItem[]>([]);

  ngOnInit() {
    this.eventService.listEvents().subscribe((events) => this.events.set(events));
  }
}
