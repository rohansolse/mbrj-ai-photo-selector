import { CommonModule } from "@angular/common";
import { Component, input, output } from "@angular/core";

import { PhotoItem } from "../../../core/models/types";
import { API_BASE_URL } from "../../../core/services/api.service";

@Component({
  selector: "app-photo-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel card">
      <img [src]="thumbnailUrl()" [alt]="photo().file_name" />
      <div class="card-body stack">
        <div style="display: flex; justify-content: space-between; gap: 12px; align-items: start;">
          <div>
            <strong>{{ photo().file_name }}</strong>
            <div class="muted">{{ photo().group_key || "No duplicate group" }}</div>
          </div>
          <div class="stack" style="justify-items: end;">
            <span class="badge" [ngClass]="badgeClass()">{{ photo().status }}</span>
            <span class="badge">{{ photo().ai_recommendation || "pending" }}</span>
          </div>
        </div>

        <div class="metric-list">
          <div>Overall: <strong>{{ photo().overall_score ?? 0 }}</strong></div>
          <div>Sharpness: <strong>{{ photo().sharpness_score ?? 0 }}</strong></div>
          <div>Smile: <strong>{{ photo().smile_score ?? 0 }}</strong></div>
          <div>Eyes: <strong>{{ photo().eyes_open_score ?? 0 }}</strong></div>
        </div>

        <label style="display: flex; gap: 8px; align-items: center; font-weight: 600;">
          <input type="checkbox" [checked]="selected()" (change)="toggled.emit(photo())" />
          Include in batch action
        </label>

        <div class="actions" *ngIf="showActions()">
          <button class="btn btn-primary" type="button" (click)="select.emit(photo())">Select</button>
          <button class="btn btn-secondary" type="button" (click)="reject.emit(photo())">Reject</button>
        </div>
      </div>
    </article>
  `,
})
export class PhotoCardComponent {
  readonly photo = input.required<PhotoItem>();
  readonly showActions = input<boolean>(false);
  readonly selected = input<boolean>(false);
  readonly select = output<PhotoItem>();
  readonly reject = output<PhotoItem>();
  readonly toggled = output<PhotoItem>();

  thumbnailUrl() {
    const path = this.photo().thumbnail_path || "";
    return path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/api$/, "")}/uploads/${path}`;
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
}
