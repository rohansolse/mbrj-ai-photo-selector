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
  imports: [CommonModule, PhotoCardComponent],
  template: `
    <section class="section panel" style="padding: 14px 16px;" *ngIf="message()">
      <span class="muted">{{ message() }}</span>
    </section>

    <section
      class="section final-selection-columns"
      [class.final-selection-columns-single]="!candidatePhotos().length"
    >
      <article class="panel final-selection-column" *ngIf="candidatePhotos().length">
        <div class="final-selection-column-header">
          <div class="stack" style="gap: 6px;">
            <span class="side-label">Shortlisted candidates</span>
            <h2 style="margin: 0;">Add into final selection</h2>
            <div class="final-selection-inline-stats">
              <span class="final-selection-chip">
                <strong>{{ candidatePhotos().length }}</strong>
                <span>Ready to add</span>
              </span>
            </div>
          </div>

          <div class="stack" style="gap: 8px; justify-items: end;">
            <span class="badge">{{ selectedCandidateCount() }} selected</span>
            <button class="btn btn-primary" type="button" (click)="batchSelect()" [disabled]="!selectedCandidateCount()">
              Add selected
            </button>
          </div>
        </div>

        <div class="gallery-grid">
          <app-photo-card
            *ngFor="let photo of candidatePhotos()"
            [photo]="photo"
            [showActions]="true"
            [selected]="selectedIds().has(photo.id)"
            [selectLabel]="'Add to final'"
            [showRejectAction]="false"
            (select)="selectPhoto($event)"
            (toggled)="toggleSelected($event)"
          />
        </div>
      </article>

      <article class="panel final-selection-column">
        <div class="final-selection-column-header">
          <div class="stack" style="gap: 6px;">
            <span class="side-label">Final selected</span>
            <h2 style="margin: 0;">Reject from final selection</h2>
            <div class="final-selection-inline-stats">
              <span class="final-selection-chip final-selection-chip-strong">
                <strong>{{ finalPhotos().length }}</strong>
                <span>Final selected</span>
              </span>
            </div>
          </div>

          <div class="stack" style="gap: 8px; justify-items: end;">
            <span class="badge shortlisted">{{ selectedFinalCount() }} selected</span>
            <button class="btn btn-danger" type="button" (click)="batchRejectFinal()" [disabled]="!selectedFinalCount()">
              Reject selected
            </button>
          </div>
        </div>

        <div class="final-selection-empty" *ngIf="!finalPhotos().length">
          <strong>No final selected photos yet.</strong>
          <span class="muted" *ngIf="candidatePhotos().length">
            Use the candidate section to add shortlisted images into the final selection.
          </span>
          <span class="muted" *ngIf="!candidatePhotos().length">
            There are no pending shortlisted candidates to promote into the final selection yet.
          </span>
        </div>

        <div class="gallery-grid" *ngIf="finalPhotos().length">
          <app-photo-card
            *ngFor="let photo of finalPhotos()"
            [photo]="photo"
            [showActions]="true"
            [selected]="selectedIds().has(photo.id)"
            [showSelectAction]="false"
            [rejectLabel]="'Reject'"
            [rejectButtonClass]="'btn-danger'"
            (reject)="rejectPhoto($event)"
            (toggled)="toggleSelected($event)"
          />
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .final-selection-inline-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .final-selection-chip {
        display: inline-flex;
        align-items: baseline;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.5);
      }

      .final-selection-chip strong {
        font-size: 1.05rem;
        line-height: 1;
      }

      .final-selection-chip span {
        color: var(--muted);
        font-size: 0.86rem;
      }

      .final-selection-chip-strong {
        background: rgba(170, 90, 44, 0.1);
        border-color: rgba(170, 90, 44, 0.14);
      }

      .final-selection-columns {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
      }

      .final-selection-columns-single {
        grid-template-columns: minmax(0, 1fr);
      }

      .final-selection-column {
        padding: 20px;
        display: grid;
        gap: 18px;
        align-content: start;
      }

      .final-selection-column-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        gap: 16px;
        flex-wrap: wrap;
      }

      .final-selection-empty {
        min-height: 160px;
        border: 1px dashed var(--line);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.45);
        display: grid;
        place-items: center;
        gap: 8px;
        text-align: center;
        padding: 20px;
      }

      @media (max-width: 900px) {
        .final-selection-columns {
          grid-template-columns: 1fr;
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
    this.eventService.getShortlisted(this.eventId()).subscribe((photos) => {
      this.photos.set(photos);
      const visibleIds = new Set(photos.map((photo) => photo.id));
      this.selectedIds.set(new Set(Array.from(this.selectedIds()).filter((id) => visibleIds.has(id))));
    });
  }

  selectPhoto(photo: PhotoItem) {
    this.eventService.selectPhoto(photo.id).subscribe(() => {
      this.message.set(`${photo.file_name} added to final selection.`);
      this.load();
    });
  }

  rejectPhoto(photo: PhotoItem) {
    this.eventService.rejectPhoto(photo.id).subscribe(() => {
      this.message.set(`${photo.file_name} rejected from the final selection.`);
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
    const selected = this.candidatePhotos().filter((photo) => this.selectedIds().has(photo.id));
    if (!selected.length) {
      this.message.set("No shortlisted candidates selected to add into final selection.");
      return;
    }

    forkJoin(selected.map((photo) => this.eventService.selectPhoto(photo.id))).subscribe(() => {
      this.selectedIds.set(new Set<number>());
      this.message.set(`${selected.length} photo(s) added to final selection.`);
      this.load();
    });
  }

  batchRejectFinal() {
    const selected = this.finalPhotos().filter((photo) => this.selectedIds().has(photo.id));
    if (!selected.length) {
      this.message.set("No final-selected photos chosen for rejection.");
      return;
    }

    forkJoin(selected.map((photo) => this.eventService.rejectPhoto(photo.id))).subscribe(() => {
      this.selectedIds.set(new Set<number>());
      this.message.set(`${selected.length} photo(s) rejected from the final selection.`);
      this.load();
    });
  }

  candidatePhotos() {
    return this.photos().filter((photo) => !photo.final_selection_id);
  }

  finalPhotos() {
    return this.photos().filter((photo) => Boolean(photo.final_selection_id));
  }

  selectedCandidateCount() {
    return this.candidatePhotos().filter((photo) => this.selectedIds().has(photo.id)).length;
  }

  selectedFinalCount() {
    return this.finalPhotos().filter((photo) => this.selectedIds().has(photo.id)).length;
  }
}
