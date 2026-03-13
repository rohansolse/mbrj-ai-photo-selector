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
          <span class="badge">Final selection workspace</span>
          <span class="final-selection-note">
            {{ candidatePhotos().length }} candidates and {{ finalPhotos().length }} final picks
          </span>
        </div>

        <div class="final-selection-heading">
          <h1>Add shortlist winners to final, then reject the rest.</h1>
          <p>Shortlisted candidates and final-selected photos are separated so the actions stay obvious.</p>
        </div>

        <div class="final-selection-meta">
          <div class="final-selection-stat">
            <strong>{{ candidatePhotos().length }}</strong>
            <span>Ready to add</span>
          </div>
          <div class="final-selection-stat">
            <strong>{{ finalPhotos().length }}</strong>
            <span>Final selected</span>
          </div>
        </div>
      </div>

      <div class="actions final-selection-actions">
        <a class="btn btn-secondary" [routerLink]="['/events', eventId(), 'summary']">Summary</a>
        <a class="btn btn-primary" [routerLink]="['/events', eventId(), 'upload']">Upload more</a>
      </div>
    </section>

    <section class="section panel" style="padding: 14px 16px;" *ngIf="message()">
      <span class="muted">{{ message() }}</span>
    </section>

    <section class="section final-selection-columns">
      <article class="panel final-selection-column">
        <div class="final-selection-column-header">
          <div class="stack" style="gap: 6px;">
            <span class="side-label">Shortlisted candidates</span>
            <h2 style="margin: 0;">Add into final selection</h2>
            <p class="muted" style="margin: 0;">
              These photos are shortlisted but not yet added to the final delivery set.
            </p>
          </div>

          <div class="stack" style="gap: 8px; justify-items: end;">
            <span class="badge">{{ selectedCandidateCount() }} selected</span>
            <button class="btn btn-primary" type="button" (click)="batchSelect()" [disabled]="!selectedCandidateCount()">
              Add selected
            </button>
          </div>
        </div>

        <div class="final-selection-empty" *ngIf="!candidatePhotos().length">
          <strong>No pending shortlisted candidates.</strong>
          <span class="muted">Everything shortlisted here has already been added to the final selection.</span>
        </div>

        <div class="gallery-grid" *ngIf="candidatePhotos().length">
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
            <p class="muted" style="margin: 0;">
              These photos are already in the final set. Reject moves them out of the final keepers.
            </p>
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
          <span class="muted">Use the candidate section to add shortlisted images into the final selection.</span>
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
        max-width: 11ch;
      }

      .final-selection-heading p {
        margin: 0;
        max-width: 56ch;
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

      .final-selection-columns {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
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
        .final-selection-hero,
        .final-selection-columns {
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
