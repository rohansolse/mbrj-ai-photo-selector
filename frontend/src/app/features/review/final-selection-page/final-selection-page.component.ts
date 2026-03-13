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
    <section class="section page-header panel">
      <div class="stack">
        <span class="badge">Final selection gallery</span>
        <h1 class="hero-title">Manual final pass on shortlisted frames.</h1>
        <p class="hero-subtitle">Use this screen as the final album shortlist before export or downstream editing.</p>
      </div>
      <div class="actions" style="align-items: start;">
        <a class="btn btn-secondary" [routerLink]="['/events', eventId(), 'summary']">Summary</a>
        <a class="btn btn-primary" [routerLink]="['/events', eventId(), 'upload']">Upload more</a>
      </div>
    </section>

    <section class="section panel" style="padding: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
        <span class="muted">{{ selectedIds().size }} selected for batch action</span>
        <div class="actions">
          <button class="btn btn-secondary" type="button" (click)="batchReject()">Reject selected</button>
          <button class="btn btn-primary" type="button" (click)="batchSelect()">Select selected</button>
        </div>
      </div>
    </section>

    <section class="section gallery-grid">
      <app-photo-card
        *ngFor="let photo of photos()"
        [photo]="photo"
        [showActions]="true"
        [selected]="selectedIds().has(photo.id)"
        (select)="selectPhoto($event)"
        (reject)="rejectPhoto($event)"
        (toggled)="toggleSelected($event)"
      />
    </section>
  `,
})
export class FinalSelectionPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  protected readonly eventId = signal(this.route.snapshot.paramMap.get("eventId") || "");
  protected readonly photos = signal<PhotoItem[]>([]);
  protected readonly selectedIds = signal(new Set<number>());

  ngOnInit() {
    this.load();
  }

  load() {
    this.eventService.getShortlisted(this.eventId()).subscribe((photos) => this.photos.set(photos));
  }

  selectPhoto(photo: PhotoItem) {
    this.eventService.selectPhoto(photo.id).subscribe(() => this.load());
  }

  rejectPhoto(photo: PhotoItem) {
    this.eventService.rejectPhoto(photo.id).subscribe(() => this.load());
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
    const selected = this.photos().filter((photo) => this.selectedIds().has(photo.id));
    if (!selected.length) {
      return;
    }

    forkJoin(selected.map((photo) => this.eventService.selectPhoto(photo.id))).subscribe(() => {
      this.selectedIds.set(new Set<number>());
      this.load();
    });
  }

  batchReject() {
    const selected = this.photos().filter((photo) => this.selectedIds().has(photo.id));
    if (!selected.length) {
      return;
    }

    forkJoin(selected.map((photo) => this.eventService.rejectPhoto(photo.id))).subscribe(() => {
      this.selectedIds.set(new Set<number>());
      this.load();
    });
  }
}
