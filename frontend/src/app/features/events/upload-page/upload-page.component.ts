import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

import { EventService } from "../../../core/services/event.service";
import { EventSummary } from "../../../core/models/types";

@Component({
  selector: "app-upload-page",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="section panel" style="padding: 28px;">
      <div class="stack">
        <div>
          <span class="badge">Upload photos</span>
          <h1>Drop a full event batch</h1>
          <p class="muted">Supports JPG, JPEG, PNG, and WEBP. Folder uploads work in Chromium-based browsers via the file picker.</p>
        </div>

        <label
          class="dropzone"
          [style.border-color]="dragging() ? 'var(--accent)' : 'rgba(174, 92, 42, 0.35)'"
          [style.background]="dragging() ? 'rgba(255, 243, 230, 0.95)' : 'rgba(255, 249, 242, 0.75)'"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave()"
          (drop)="onDrop($event)"
        >
          <input #fileInput hidden type="file" multiple accept=".jpg,.jpeg,.png,.webp" (change)="onFileSelect($event)" />
          <input
            #folderInput
            hidden
            type="file"
            multiple
            webkitdirectory=""
            directory=""
            accept=".jpg,.jpeg,.png,.webp"
            (change)="onFileSelect($event)"
          />
          <strong>{{ uploadFeedback() ? "Upload complete" : "Drag files here or click to browse" }}</strong>
          <div class="muted">
            {{ uploadStatusLine() }}
          </div>
          <div class="actions" style="justify-content: center; margin-top: 16px;">
            <button class="btn btn-secondary" type="button" (click)="fileInput.click(); $event.preventDefault()">Pick files</button>
            <button class="btn btn-secondary" type="button" (click)="folderInput.click(); $event.preventDefault()">Pick folder</button>
          </div>
        </label>

        <section class="upload-feedback panel" *ngIf="uploadFeedback() as feedback">
          <div class="upload-feedback-copy">
            <span class="badge shortlisted">Photos uploaded</span>
            <strong>{{ feedback.uploadedCount }} photo{{ feedback.uploadedCount === 1 ? "" : "s" }} uploaded successfully.</strong>
            <span class="muted">
              Total uploaded for this event: {{ summary()?.total_uploaded || feedback.uploadedCount }}.
            </span>
          </div>
          <div class="actions">
            <button class="btn btn-secondary" type="button" (click)="clearUploadFeedback()">Dismiss</button>
            <button class="btn btn-primary" type="button" (click)="processEvent()" [disabled]="processing()">
              {{ processing() ? "Queued..." : "Start AI processing" }}
            </button>
          </div>
        </section>

        <div class="actions">
          <button class="btn btn-primary" type="button" (click)="upload()" [disabled]="!files().length || uploading()">
            {{ uploading() ? "Uploading..." : "Upload batch" }}
          </button>
          <button class="btn btn-secondary" type="button" (click)="processEvent()" [disabled]="processing()">
            {{ processing() ? "Queued..." : "Start AI processing" }}
          </button>
          <a class="btn btn-secondary" [routerLink]="['/events', eventId(), 'processing']">Open processing view</a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .upload-feedback {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 16px 18px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.58);
      }

      .upload-feedback-copy {
        display: grid;
        gap: 4px;
      }

      @media (max-width: 780px) {
        .upload-feedback {
          flex-direction: column;
          align-items: start;
        }
      }
    `,
  ],
})
export class UploadPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);

  protected readonly files = signal<File[]>([]);
  protected readonly uploading = signal(false);
  protected readonly processing = signal(false);
  protected readonly dragging = signal(false);
  protected readonly eventId = signal(this.route.snapshot.paramMap.get("eventId") || "");
  protected readonly selectedCount = signal(0);
  protected readonly uploadFeedback = signal<{ uploadedCount: number } | null>(null);
  protected readonly summary = signal<EventSummary | null>(null);

  ngOnInit() {
    this.refreshSummary();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    this.setFiles(Array.from(input.files || []));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave() {
    this.dragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(false);
    this.setFiles(Array.from(event.dataTransfer?.files || []));
  }

  private setFiles(files: File[]) {
    this.files.set(files);
    this.selectedCount.set(files.length);
    this.uploadFeedback.set(null);
  }

  async upload() {
    this.uploading.set(true);
    try {
      const result = await this.eventService.uploadPhotos(this.eventId(), this.files());
      this.files.set([]);
      this.selectedCount.set(0);
      this.uploadFeedback.set({ uploadedCount: result.uploadedCount || 0 });
      this.refreshSummary();
    } finally {
      this.uploading.set(false);
    }
  }

  processEvent() {
    this.processing.set(true);
    this.eventService.processEvent(this.eventId()).subscribe(() => {
      this.processing.set(false);
      this.router.navigate(["/events", this.eventId(), "processing"]);
    });
  }

  clearUploadFeedback() {
    this.uploadFeedback.set(null);
  }

  uploadStatusLine() {
    if (this.uploading()) {
      return `Uploading ${this.selectedCount()} file${this.selectedCount() === 1 ? "" : "s"}...`;
    }

    if (this.uploadFeedback()) {
      return `${this.uploadFeedback()!.uploadedCount} file${this.uploadFeedback()!.uploadedCount === 1 ? "" : "s"} uploaded successfully.`;
    }

    if (this.selectedCount()) {
      return `${this.selectedCount()} file${this.selectedCount() === 1 ? "" : "s"} selected`;
    }

    const totalUploaded = this.summary()?.total_uploaded || 0;
    return totalUploaded
      ? `${totalUploaded} photo${totalUploaded === 1 ? "" : "s"} already uploaded for this event`
      : "No photos uploaded yet";
  }

  private refreshSummary() {
    this.eventService.getSummary(this.eventId()).subscribe((summary) => this.summary.set(summary));
  }
}
