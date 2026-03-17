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
      <article class="panel duplicate-group" *ngFor="let group of groups()">
        <div class="stack">
          <div class="duplicate-group-header">
            <div class="duplicate-group-title">
              <span class="side-label">Duplicate group</span>
              <strong title="{{ group.group_key }}">Group {{ group.group_key }}</strong>
            </div>
            <span class="duplicate-group-count">{{ group.photo_count }} photo{{ group.photo_count === 1 ? "" : "s" }}</span>
          </div>

          <div class="duplicate-photo-grid">
            <article class="duplicate-photo-card" *ngFor="let photo of group.photos">
              <div class="duplicate-photo-frame">
                <img class="duplicate-photo-image" [src]="thumbnailUrl(photo.thumbnail_path)" [alt]="photo.file_name" />
              </div>
              <div class="duplicate-photo-body">
                <strong class="duplicate-photo-name" [title]="photo.file_name">{{ photo.file_name }}</strong>
                <span class="duplicate-photo-status">{{ formatStatus(photo.status) }}</span>
              </div>
            </article>
          </div>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .duplicate-group {
        padding: 20px;
      }

      .duplicate-group-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        gap: 16px;
        flex-wrap: wrap;
      }

      .duplicate-group-title {
        min-width: 0;
        display: grid;
        gap: 6px;
      }

      .duplicate-group-title strong {
        font-size: 1.4rem;
        line-height: 1.1;
        letter-spacing: -0.02em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .duplicate-group-count {
        display: inline-flex;
        align-items: center;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(170, 90, 44, 0.1);
        color: var(--accent);
        font-weight: 700;
        white-space: nowrap;
      }

      .duplicate-photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 280px));
        gap: 18px;
      }

      .duplicate-photo-card {
        overflow: hidden;
        border-radius: 22px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.42);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);
      }

      .duplicate-photo-frame {
        aspect-ratio: 3 / 4;
        display: grid;
        place-items: center;
        padding: 14px;
        background: linear-gradient(180deg, rgba(108, 79, 58, 0.08), rgba(108, 79, 58, 0.02));
        border-bottom: 1px solid var(--line);
      }

      .duplicate-photo-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 16px;
        display: block;
        background: #f2eadf;
      }

      .duplicate-photo-body {
        display: grid;
        gap: 6px;
        padding: 14px 16px 16px;
      }

      .duplicate-photo-name {
        display: block;
        font-size: 0.98rem;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .duplicate-photo-status {
        color: var(--muted);
        font-size: 0.92rem;
        font-weight: 600;
      }

      @media (max-width: 640px) {
        .duplicate-photo-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
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

  formatStatus(status: string) {
    return (status || "pending").replaceAll("_", " ");
  }
}
