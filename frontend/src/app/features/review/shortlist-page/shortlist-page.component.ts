import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { forkJoin } from "rxjs";

import { PhotoItem } from "../../../core/models/types";
import { EventService } from "../../../core/services/event.service";
import { FilterBarComponent } from "../../../shared/components/filter-bar/filter-bar.component";
import { PhotoCardComponent } from "../../../shared/components/photo-card/photo-card.component";

@Component({
  selector: "app-shortlist-page",
  standalone: true,
  imports: [CommonModule, RouterLink, FilterBarComponent, PhotoCardComponent],
  template: `
    <section class="section page-header panel">
      <div class="stack">
        <span class="badge">AI shortlist gallery</span>
        <h1 class="hero-title">Review AI recommendations, rejects, and photos needing manual judgment.</h1>
      </div>
      <div class="actions" style="align-items: start;">
        <a class="btn btn-secondary" [routerLink]="['/events', eventId(), 'duplicates']">Duplicate review</a>
        <a class="btn btn-primary" [routerLink]="['/events', eventId(), 'final-selection']">Final selection</a>
      </div>
    </section>

    <app-filter-bar (filtersChange)="loadPhotos($event)"></app-filter-bar>

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
export class ShortlistPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  protected readonly eventId = signal(this.route.snapshot.paramMap.get("eventId") || "");
  protected readonly photos = signal<PhotoItem[]>([]);
  protected readonly selectedIds = signal(new Set<number>());

  ngOnInit() {
    this.loadPhotos({ sortBy: "overall" });
  }

  loadPhotos(filters: Record<string, string>) {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });

    this.eventService.getPhotos(this.eventId(), searchParams).subscribe((photos) => this.photos.set(photos));
  }

  selectPhoto(photo: PhotoItem) {
    this.eventService.selectPhoto(photo.id).subscribe(() => this.loadPhotos({ sortBy: "overall" }));
  }

  rejectPhoto(photo: PhotoItem) {
    this.eventService.rejectPhoto(photo.id).subscribe(() => this.loadPhotos({ sortBy: "overall" }));
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
      this.loadPhotos({ sortBy: "overall" });
    });
  }

  batchReject() {
    const selected = this.photos().filter((photo) => this.selectedIds().has(photo.id));
    if (!selected.length) {
      return;
    }

    forkJoin(selected.map((photo) => this.eventService.rejectPhoto(photo.id))).subscribe(() => {
      this.selectedIds.set(new Set<number>());
      this.loadPhotos({ sortBy: "overall" });
    });
  }
}
