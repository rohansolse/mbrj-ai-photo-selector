import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { DuplicateGroup } from "../../../core/models/types";
import { EventService } from "../../../core/services/event.service";
import { API_BASE_URL } from "../../../core/services/api.service";

@Component({
  selector: "app-duplicates-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section stack">
      <article class="panel" style="padding: 20px;" *ngFor="let group of groups()">
        <div class="stack">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>Group {{ group.group_key }}</strong>
            <span class="badge">{{ group.photo_count }} photos</span>
          </div>

          <div class="gallery-grid">
            <article class="panel card" *ngFor="let photo of group.photos">
              <img [src]="thumbnailUrl(photo.thumbnail_path)" [alt]="photo.file_name" />
              <div class="card-body">
                <strong>{{ photo.file_name }}</strong>
                <div class="muted">{{ photo.status }}</div>
              </div>
            </article>
          </div>
        </div>
      </article>
    </section>
  `,
})
export class DuplicatesPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  protected readonly eventId = signal(this.route.snapshot.paramMap.get("eventId") || "");
  protected readonly groups = signal<DuplicateGroup[]>([]);

  ngOnInit() {
    this.eventService.getDuplicates(this.eventId()).subscribe((groups) => this.groups.set(groups));
  }

  thumbnailUrl(path: string) {
    return path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/api$/, "")}/uploads/${path}`;
  }
}
