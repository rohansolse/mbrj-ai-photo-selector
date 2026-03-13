import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { finalize, forkJoin } from "rxjs";

import { EventSummary, PhotoItem } from "../../../core/models/types";
import { EventService } from "../../../core/services/event.service";
import { FilterBarComponent } from "../../../shared/components/filter-bar/filter-bar.component";
import { PhotoCardComponent } from "../../../shared/components/photo-card/photo-card.component";

interface ShortlistFilters {
  status?: string;
  recommendation?: string;
  sortBy?: string;
  isDuplicate?: string;
  isBlurry?: string;
  isSmiling?: string;
  hasFace?: string;
}

@Component({
  selector: "app-shortlist-page",
  standalone: true,
  imports: [CommonModule, FilterBarComponent, PhotoCardComponent],
  template: `
    <section class="section panel shortlist-hub">
      <div class="shortlist-overview">
        <div class="shortlist-copy">
          <span class="badge">Shortlist review</span>
          <strong class="shortlist-summary">Manage selections and refine the visible set.</strong>
        </div>

        <div class="shortlist-meta">
          <div class="shortlist-stat">
            <strong>{{ selectedPhotoCount() }}</strong>
            <span>Already selected</span>
          </div>
          <div class="shortlist-stat">
            <strong>{{ visiblePhotoCount() }}</strong>
            <span>Visible now out of {{ totalPhotoCount() }}</span>
          </div>
        </div>
      </div>

      <app-filter-bar
        [visibleCount]="visiblePhotoCount()"
        [totalCount]="totalPhotoCount()"
        [embedded]="true"
        (filtersChange)="loadPhotos($event)"
      ></app-filter-bar>
    </section>

    <section class="section panel" style="padding: 16px;" *ngIf="selectedIds().size">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
        <span class="muted">{{ selectedIds().size }} selected for batch action</span>
        <div class="actions">
          <button class="btn btn-secondary" type="button" (click)="batchReject()" [disabled]="!selectedIds().size">
            Reject selected
          </button>
          <button class="btn btn-primary" type="button" (click)="batchSelect()" [disabled]="!selectedIds().size">
            Select selected
          </button>
        </div>
      </div>
    </section>

    <section class="section gallery-grid">
      <app-photo-card
        *ngFor="let photo of photos(); trackBy: trackPhotoId"
        [photo]="photo"
        [showActions]="true"
        [selected]="selectedIds().has(photo.id)"
        [disableSelectAction]="!!photo.final_selection_id || pendingIds().has(photo.id)"
        [disableRejectAction]="photo.status === 'rejected' || pendingIds().has(photo.id)"
        (select)="selectPhoto($event)"
        (reject)="rejectPhoto($event)"
        (toggled)="toggleSelected($event)"
      />
    </section>
  `,
  styles: [
    `
      .shortlist-hub {
        padding: 22px 28px 24px;
      }

      .shortlist-overview {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 18px;
        align-items: end;
        margin: 0;
        padding-bottom: 18px;
        border-bottom: 1px solid var(--line);
      }

      .shortlist-copy {
        min-width: 0;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px 14px;
      }

      .shortlist-summary {
        color: var(--muted);
        font-size: 0.96rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }

      .shortlist-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        justify-content: end;
        align-items: stretch;
      }

      .shortlist-stat {
        min-width: 0;
        padding: 12px 16px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.4));
        display: grid;
        gap: 4px;
        min-height: 96px;
        align-content: center;
      }

      .shortlist-stat strong {
        font-size: 1.9rem;
        line-height: 1;
      }

      .shortlist-stat span {
        color: var(--muted);
        font-size: 0.9rem;
      }

      @media (max-width: 1180px) {
        .shortlist-hub {
          padding-inline: 22px;
        }
      }

      @media (max-width: 900px) {
        .shortlist-overview {
          grid-template-columns: 1fr;
          align-items: start;
        }

        .shortlist-meta {
          justify-content: start;
          max-width: 420px;
        }
      }

      @media (max-width: 560px) {
        .shortlist-hub {
          padding: 18px;
        }

        .shortlist-meta {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ShortlistPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  protected readonly eventId = signal(this.route.snapshot.paramMap.get("eventId") || "");
  protected readonly photos = signal<PhotoItem[]>([]);
  protected readonly summary = signal<EventSummary | null>(null);
  protected readonly selectedIds = signal(new Set<number>());
  protected readonly pendingIds = signal(new Set<number>());
  private readonly currentFilters = signal<ShortlistFilters>({ sortBy: "overall" });

  ngOnInit() {
    this.refreshSummary();
    this.loadPhotos({ sortBy: "overall" });
  }

  loadPhotos(filters: ShortlistFilters) {
    this.currentFilters.set(filters);
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });

    this.eventService.getPhotos(this.eventId(), searchParams).subscribe((photos) => {
      this.photos.set(photos);
      this.selectedIds.set(new Set(Array.from(this.selectedIds()).filter((id) => photos.some((photo) => photo.id === id))));
    });
  }

  selectPhoto(photo: PhotoItem) {
    if (photo.final_selection_id || this.pendingIds().has(photo.id)) {
      return;
    }

    this.markPending(photo.id, true);
    this.eventService
      .selectPhoto(photo.id)
      .pipe(finalize(() => this.markPending(photo.id, false)))
      .subscribe((selection) => {
        this.applyPhotoUpdates([
          {
            id: photo.id,
            changes: {
              status: "shortlisted",
              final_selection_id: selection.id,
              final_selection_source: selection.source || "manual",
            },
          },
        ]);
        this.refreshSummary();
      });
  }

  rejectPhoto(photo: PhotoItem) {
    if (photo.status === "rejected" || this.pendingIds().has(photo.id)) {
      return;
    }

    this.markPending(photo.id, true);
    this.eventService
      .rejectPhoto(photo.id)
      .pipe(finalize(() => this.markPending(photo.id, false)))
      .subscribe(() => {
        this.applyPhotoUpdates([
          {
            id: photo.id,
            changes: {
              status: "rejected",
              final_selection_id: null,
              final_selection_source: null,
            },
          },
        ]);
        this.refreshSummary();
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
      (photo) => this.selectedIds().has(photo.id) && !photo.final_selection_id && !this.pendingIds().has(photo.id),
    );
    if (!selected.length) {
      return;
    }

    this.markPendingBatch(selected, true);
    forkJoin(selected.map((photo) => this.eventService.selectPhoto(photo.id)))
      .pipe(finalize(() => this.markPendingBatch(selected, false)))
      .subscribe((selections) => {
        this.selectedIds.set(new Set<number>());
        this.applyPhotoUpdates(
          selected.map((photo, index) => ({
            id: photo.id,
            changes: {
              status: "shortlisted",
              final_selection_id: selections[index]?.id || photo.final_selection_id || photo.id,
              final_selection_source: selections[index]?.source || "manual",
            },
          })),
        );
        this.refreshSummary();
      });
  }

  batchReject() {
    const selected = this.photos().filter(
      (photo) => this.selectedIds().has(photo.id) && photo.status !== "rejected" && !this.pendingIds().has(photo.id),
    );
    if (!selected.length) {
      return;
    }

    this.markPendingBatch(selected, true);
    forkJoin(selected.map((photo) => this.eventService.rejectPhoto(photo.id)))
      .pipe(finalize(() => this.markPendingBatch(selected, false)))
      .subscribe(() => {
        this.selectedIds.set(new Set<number>());
        this.applyPhotoUpdates(
          selected.map((photo) => ({
            id: photo.id,
            changes: {
              status: "rejected",
              final_selection_id: null,
              final_selection_source: null,
            },
          })),
        );
        this.refreshSummary();
      });
  }

  trackPhotoId(_index: number, photo: PhotoItem) {
    return photo.id;
  }

  selectedPhotoCount() {
    return Number(this.summary()?.final_selected_count || 0);
  }

  visiblePhotoCount() {
    return this.photos().length;
  }

  totalPhotoCount() {
    return Number(this.summary()?.total_uploaded || this.photos().length);
  }

  private markPending(photoId: number, pending: boolean) {
    const next = new Set(this.pendingIds());
    if (pending) {
      next.add(photoId);
    } else {
      next.delete(photoId);
    }
    this.pendingIds.set(next);
  }

  private markPendingBatch(photos: PhotoItem[], pending: boolean) {
    const next = new Set(this.pendingIds());
    photos.forEach((photo) => {
      if (pending) {
        next.add(photo.id);
      } else {
        next.delete(photo.id);
      }
    });
    this.pendingIds.set(next);
  }

  private applyPhotoUpdates(updates: Array<{ id: number; changes: Partial<PhotoItem> }>) {
    const updatesById = new Map(updates.map((update) => [update.id, update.changes]));
    const nextPhotos = this.photos()
      .map((photo) => (updatesById.has(photo.id) ? { ...photo, ...updatesById.get(photo.id) } : photo))
      .filter((photo) => this.matchesCurrentFilters(photo));

    this.photos.set(nextPhotos);
    this.selectedIds.set(new Set(Array.from(this.selectedIds()).filter((id) => nextPhotos.some((photo) => photo.id === id))));
  }

  private matchesCurrentFilters(photo: PhotoItem) {
    const filters = this.currentFilters();

    if (filters["status"] && photo.status !== filters["status"]) {
      return false;
    }

    if (filters["recommendation"] && photo.ai_recommendation !== filters["recommendation"]) {
      return false;
    }

    if (filters["isDuplicate"] === "true" && !photo.is_duplicate) {
      return false;
    }

    if (filters["isBlurry"] === "true" && (photo.sharpness_score || 0) >= 28) {
      return false;
    }

    if (filters["isSmiling"] === "true" && (photo.smile_score || 0) < 55) {
      return false;
    }

    if (filters["hasFace"] === "true" && (photo.face_score || 0) < 40) {
      return false;
    }

    return true;
  }

  private refreshSummary() {
    this.eventService.getSummary(this.eventId()).subscribe((summary) => this.summary.set(summary));
  }
}
