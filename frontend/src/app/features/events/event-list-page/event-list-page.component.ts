import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { finalize } from "rxjs";

import { EventService } from "../../../core/services/event.service";
import { EventItem } from "../../../core/models/types";

@Component({
  selector: "app-event-list-page",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="section panel event-board">
      <div class="event-board-header">
        <div class="stack" style="gap: 6px;">
          <span class="side-label">Workspace list</span>
          <h2 style="margin: 0;">Available events</h2>
          <p class="muted" style="margin: 0;">Select an event below to continue the review flow or manage its uploads.</p>
        </div>

        <div class="event-board-meta">
          <strong>{{ events().length }}</strong>
          <span class="muted">total workspaces</span>
        </div>
      </div>

      <div class="event-empty" *ngIf="!events().length">
        <div class="stack" style="gap: 10px;">
          <strong>No events yet</strong>
          <p class="muted" style="margin: 0;">Start with one event workspace, upload a batch, and let the local pipeline score the shoot.</p>
        </div>
        <a class="btn btn-primary" routerLink="/events/new">Create your first event</a>
      </div>

      <div class="event-card-list" *ngIf="events().length">
        <article class="event-card" *ngFor="let event of events()">
          <div class="event-card-main">
            <div class="stack" style="gap: 8px;">
              <strong class="event-card-title">{{ event.event_name }}</strong>
              <div class="event-card-meta">
                <span>{{ event.event_type }}</span>
                <span>{{ event.total_photos || 0 }} photos</span>
              </div>
            </div>
          </div>

          <div class="event-card-actions">
            <a class="btn btn-secondary" [routerLink]="['/events', event.id, 'upload']">Upload</a>
            <a class="btn btn-secondary" [routerLink]="['/events', event.id, 'summary']">Summary</a>
            <a class="btn btn-primary" [routerLink]="['/events', event.id, 'shortlist']">Review</a>
            <button
              class="btn btn-danger"
              type="button"
              (click)="deleteEvent(event)"
              [disabled]="deletingEventId() === event.id"
            >
              {{ deletingEventId() === event.id ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </article>
      </div>

      <section class="panel" style="padding: 14px 16px;" *ngIf="feedback()">
        <span class="muted">{{ feedback() }}</span>
      </section>
      </section>
  `,
})
export class EventListPageComponent implements OnInit {
  private readonly eventService = inject(EventService);

  protected readonly events = signal<EventItem[]>([]);
  protected readonly deletingEventId = signal<number | null>(null);
  protected readonly feedback = signal("");

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.listEvents().subscribe((events) => this.events.set(events));
  }

  deleteEvent(event: EventItem) {
    const shouldDelete = globalThis.confirm(
      `Delete "${event.event_name}"? This removes the event, uploaded photos, scores, shortlist state, and final selections.`,
    );
    if (!shouldDelete) {
      return;
    }

    this.feedback.set("");
    this.deletingEventId.set(event.id);
    this.eventService
      .deleteEvent(event.id)
      .pipe(finalize(() => this.deletingEventId.set(null)))
      .subscribe({
        next: () => {
          this.feedback.set(`Deleted ${event.event_name}.`);
          this.loadEvents();
        },
        error: () => {
          this.feedback.set(`Could not delete ${event.event_name}. Try again.`);
        },
      });
  }
}
