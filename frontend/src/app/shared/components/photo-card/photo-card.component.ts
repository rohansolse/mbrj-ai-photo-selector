import { CommonModule } from "@angular/common";
import { Component, input, output } from "@angular/core";

import { PhotoItem } from "../../../core/models/types";
import { API_BASE_URL } from "../../../core/services/api.service";

@Component({
  selector: "app-photo-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel photo-card-shell" [class.photo-card-selected]="selected()">
      <div class="photo-frame" [ngClass]="orientationClass()">
        <img class="photo-frame-image" [src]="thumbnailUrl()" [alt]="photo().file_name" />
      </div>

      <div class="photo-card-body">
        <div class="photo-card-header">
          <div class="photo-card-title-wrap">
            <strong class="photo-card-title" [title]="photo().file_name">{{ photo().file_name }}</strong>
            <div class="photo-card-subtitle">{{ duplicateLabel() }}</div>
          </div>

          <div class="photo-card-badges">
            <span class="badge shortlisted" *ngIf="photo().final_selection_id">final selected</span>
            <span class="badge" [ngClass]="badgeClass()">{{ statusLabel() }}</span>
            <span class="badge manual">{{ recommendationLabel() }}</span>
          </div>
        </div>

        <div class="metric-list photo-card-metrics">
          <div>Overall <strong>{{ score(photo().overall_score) }}</strong></div>
          <div>Sharpness <strong>{{ score(photo().sharpness_score) }}</strong></div>
          <div>Smile <strong>{{ score(photo().smile_score) }}</strong></div>
          <div>Eyes Open <strong>{{ score(photo().eyes_open_score) }}</strong></div>
        </div>

        <label class="photo-card-toggle">
          <input type="checkbox" [checked]="selected()" (change)="toggled.emit(photo())" />
          <span>Include in batch action</span>
        </label>

        <div class="actions photo-card-actions" *ngIf="showActions()">
          <button
            *ngIf="showSelectAction()"
            class="btn"
            [ngClass]="selectButtonClass()"
            type="button"
            (click)="select.emit(photo())"
          >
            {{ selectLabel() }}
          </button>
          <button
            *ngIf="showRejectAction()"
            class="btn"
            [ngClass]="rejectButtonClass()"
            type="button"
            (click)="reject.emit(photo())"
          >
            {{ rejectLabel() }}
          </button>
        </div>
      </div>
    </article>
  `,
})
export class PhotoCardComponent {
  readonly photo = input.required<PhotoItem>();
  readonly showActions = input<boolean>(false);
  readonly selected = input<boolean>(false);
  readonly selectLabel = input<string>("Select");
  readonly rejectLabel = input<string>("Reject");
  readonly showSelectAction = input<boolean>(true);
  readonly showRejectAction = input<boolean>(true);
  readonly selectButtonClass = input<string>("btn-primary");
  readonly rejectButtonClass = input<string>("btn-secondary");
  readonly select = output<PhotoItem>();
  readonly reject = output<PhotoItem>();
  readonly toggled = output<PhotoItem>();

  thumbnailUrl() {
    const path = this.photo().thumbnail_path || "";
    return path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/api$/, "")}/uploads/${path}`;
  }

  orientationClass() {
    return (this.photo().height || 0) > (this.photo().width || 0) ? "portrait" : "landscape";
  }

  badgeClass() {
    const status = this.photo().status;
    if (status === "shortlisted") {
      return "shortlisted";
    }
    if (status === "rejected") {
      return "rejected";
    }
    return "manual";
  }

  duplicateLabel() {
    return this.photo().group_key ? `Duplicate group ${this.photo().group_key}` : "No duplicate group";
  }

  statusLabel() {
    const status = this.photo().status || "pending";
    return status.replaceAll("_", " ");
  }

  recommendationLabel() {
    const recommendation = this.photo().ai_recommendation || "pending";
    return recommendation.replaceAll("_", " ");
  }

  score(value?: number) {
    return Number(value || 0).toFixed(2);
  }
}
