import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { forkJoin } from "rxjs";

import { PhotoItem } from "../../../core/models/types";
import { EventService } from "../../../core/services/event.service";
import { PhotoCardComponent } from "../../../shared/components/photo-card/photo-card.component";

@Component({
  selector: "app-final-selection-page",
  standalone: true,
  imports: [CommonModule, RouterLink, PhotoCardComponent],
  template: `
    <section class="section panel final-selection-hero">
      <div class="final-selection-copy">
        <div class="eyebrow-row">
          <span class="badge">Final selection gallery</span>
          <span class="final-selection-note">{{ photos().length }} shortlisted frames ready</span>
        </div>
        <div class="final-selection-heading">
          <h1>Finalize shortlisted frames</h1>
          <p>Make the last keep-or-reject pass before export and downstream editing.</p>
        </div>
        <div class="final-selection-meta">
          <div class="final-selection-stat">
            <strong>{{ photos().length }}</strong>
            <span>In review</span>
          </div>
          <div class="final-selection-stat">
            <strong>{{ selectedIds().size }}</strong>
            <span>Checked now</span>
          </div>
        </div>
      </div>
      <div class="actions final-selection-actions">
        <a class="btn btn-secondary" [routerLink]="['/events', eventId(), 'summary']">Summary</a>
        <a class="btn btn-primary" [routerLink]="['/events', eventId(), 'upload']">Upload more</a>
      </div>
    </section>

    <section class="section panel" style="padding: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
        <div class="stack" style="gap: 4px;">
          <span class="muted">{{ selectedIds().size }} selected for batch action</span>
          <span class="badge shortlisted">{{ finalSelectedCount() }} in final selection</span>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" type="button" (click)="batchUnselect()" [disabled]="!selectedIds().size">
            Remove selected
          </button>
          <button class="btn btn-primary" type="button" (click)="batchSelect()" [disabled]="!selectedIds().size">
            Add selected
          </button>
        </div>
      </div>
    </section>

    <section class="section panel" style="padding: 14px 16px;" *ngIf="message()">
      <span class="muted">{{ message() }}</span>
    </section>

    <section class="section gallery-grid">
      <app-photo-card
        *ngFor="let photo of photos()"
        [photo]="photo"
        [showActions]="true"
        [selected]="selectedIds().has(photo.id)"
        [selectLabel]="photo.final_selection_id ? 'Selected' : 'Add to final'"
        [rejectLabel]="photo.final_selection_id ? 'Remove' : 'Skip'"
        (select)="selectPhoto($event)"
        (reject)="rejectPhoto($event)"
        (toggled)="toggleSelected($event)"
      />
    </section>
  `,
  styles: [
    `
      .final-selection-hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 20px;
        align-items: start;
        padding: 24px;
      }

      .final-selection-copy {
        display: grid;
        gap: 18px;
        min-width: 0;
      }

      .final-selection-heading {
        display: grid;
        gap: 10px;
      }

      .final-selection-heading h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3.25rem);
        line-height: 0.98;
        letter-spacing: -0.05em;
        max-width: 10ch;
      }

      .final-selection-heading p {
        margin: 0;
        max-width: 52ch;
        color: var(--muted);
        font-size: 1rem;
        line-height: 1.5;
      }

      .final-selection-note {
        color: var(--muted);
        font-weight: 600;
      }

      .final-selection-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .final-selection-stat {
        min-width: 130px;
        padding: 12px 14px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.55);
        display: grid;
        gap: 4px;
      }

      .final-selection-stat strong {
        font-size: 1.25rem;
        line-height: 1;
      }

      .final-selection-stat span {
        color: var(--muted);
        font-size: 0.9rem;
      }

      .final-selection-actions {
        align-items: start;
        justify-content: end;
      }

      @media (max-width: 900px) {
        .final-selection-hero {
          grid-template-columns: 1fr;
        }

        .final-selection-heading h1 {
          max-width: 12ch;
        }

        .final-selection-actions {
          justify-content: start;
        }
      }
    `,
  ],
})
export class FinalSelectionPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  protected readonly eventId = signal(this.route.snapshot.paramMap.get("eventId") || "");
  protected readonly photos = signal<PhotoItem[]>([]);
  protected readonly selectedIds = signal(new Set<number>());
  protected readonly message = signal("");

  ngOnInit() {
    this.load();
  }

  load() {
    this.eventService.getShortlisted(this.eventId()).subscribe((photos) => this.photos.set(photos));
  }

  selectPhoto(photo: PhotoItem) {
    if (photo.final_selection_id) {
      this.message.set(`${photo.file_name} is already in final selection.`);
      return;
    }

    this.eventService.selectPhoto(photo.id).subscribe(() => {
      this.message.set(`${photo.file_name} added to final selection.`);
      this.load();
    });
  }

  rejectPhoto(photo: PhotoItem) {
    if (!photo.final_selection_id) {
      this.message.set(`${photo.file_name} is still available in the shortlist.`);
      return;
    }

    this.eventService.unselectPhoto(photo.id).subscribe(() => {
      this.message.set(`${photo.file_name} removed from final selection.`);
      this.load();
    });
  }

  toggleSelected(photo: PhotoItem) {
    const next = new Set(this.selectedIds());
    if (next.has(photo.id)) {
      next.delete(photo.id);
    } else {
      next.add(photo.id);
    }
    this.selectedIds.set(next);
  }

  batchSelect() {
    const selected = this.photos().filter(
      (photo) => this.selectedIds().has(photo.id) && !photo.final_selection_id,
    );
    if (!selected.length) {
      this.message.set("No unselected photos chosen for final selection.");
      return;
    }

    forkJoin(selected.map((photo) => this.eventService.selectPhoto(photo.id))).subscribe(() => {
      this.selectedIds.set(new Set<number>());
      this.message.set(`${selected.length} photo(s) added to final selection.`);
      this.load();
    });
  }

  batchUnselect() {
    const selected = this.photos().filter(
      (photo) => this.selectedIds().has(photo.id) && Boolean(photo.final_selection_id),
    );
    if (!selected.length) {
      this.message.set("No final-selected photos chosen for removal.");
      return;
    }

    forkJoin(selected.map((photo) => this.eventService.unselectPhoto(photo.id))).subscribe(() => {
      this.selectedIds.set(new Set<number>());
      this.message.set(`${selected.length} photo(s) removed from final selection.`);
      this.load();
    });
  }

  finalSelectedCount() {
    return this.photos().filter((photo) => Boolean(photo.final_selection_id)).length;
  }
}
