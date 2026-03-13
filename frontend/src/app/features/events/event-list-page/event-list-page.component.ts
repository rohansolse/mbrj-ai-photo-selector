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
    <section class="section panel event-list-hero">
      <div class="event-list-copy">
        <span class="badge">Events</span>
        <div class="stack" style="gap: 10px;">
          <h1 class="event-list-title">Choose an event workspace</h1>
          <p class="event-list-subtitle">
            Start from the list below to upload more photos, review shortlisted frames, or open the full event summary.
          </p>
        </div>
      </div>

      <div class="event-list-summary">
        <strong>{{ events().length }}</strong>
        <span class="muted">workspaces available</span>
      </div>
    </section>

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
  styles: [
    `
      .event-list-hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 20px;
        align-items: end;
        padding: 24px;
      }

      .event-list-copy {
        display: grid;
        gap: 14px;
      }

      .event-list-title {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3.2rem);
        line-height: 1;
        letter-spacing: -0.05em;
      }

      .event-list-subtitle {
        margin: 0;
        max-width: 54ch;
        color: var(--muted);
        font-size: 1rem;
        line-height: 1.55;
      }

      .event-list-summary {
        display: grid;
        justify-items: end;
        gap: 6px;
        text-align: right;
      }

      .event-list-summary strong {
        font-size: clamp(2rem, 4vw, 3rem);
        line-height: 1;
      }

      @media (max-width: 900px) {
        .event-list-hero {
          grid-template-columns: 1fr;
          align-items: start;
        }

        .event-list-summary {
          justify-items: start;
          text-align: left;
        }
      }
    `,
  ],
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
