import { CommonModule } from "@angular/common";
import { Component, output } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-filter-bar",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="panel toolbar" style="padding: 18px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
      <label class="field">
        <span>Status</span>
        <select [(ngModel)]="status" (ngModelChange)="emitChange()">
          <option value="">All</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="needs_manual_review">Needs Manual Review</option>
          <option value="processing">Processing</option>
        </select>
      </label>

      <label class="field">
        <span>Recommendation</span>
        <select [(ngModel)]="recommendation" (ngModelChange)="emitChange()">
          <option value="">All</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="needs_manual_review">Manual Review</option>
        </select>
      </label>

      <label class="field">
        <span>Sort By</span>
        <select [(ngModel)]="sortBy" (ngModelChange)="emitChange()">
          <option value="overall">Overall Score</option>
          <option value="sharpness">Sharpness</option>
          <option value="smile">Smile Score</option>
          <option value="newest">Newest</option>
        </select>
      </label>

      <label class="field">
        <span>Duplicate</span>
        <select [(ngModel)]="isDuplicate" (ngModelChange)="emitChange()">
          <option value="">Any</option>
          <option value="true">Only duplicates</option>
        </select>
      </label>

      <label class="field">
        <span>Blurry</span>
        <select [(ngModel)]="isBlurry" (ngModelChange)="emitChange()">
          <option value="">Any</option>
          <option value="true">Likely blurry</option>
        </select>
      </label>

      <label class="field">
        <span>Smiling</span>
        <select [(ngModel)]="isSmiling" (ngModelChange)="emitChange()">
          <option value="">Any</option>
          <option value="true">Smiling faces</option>
        </select>
      </label>

      <label class="field">
        <span>Face Detected</span>
        <select [(ngModel)]="hasFace" (ngModelChange)="emitChange()">
          <option value="">Any</option>
          <option value="true">Faces only</option>
        </select>
      </label>
    </section>
  `,
})
export class FilterBarComponent {
  readonly filtersChange = output<Record<string, string>>();

  protected status = "";
  protected recommendation = "";
  protected sortBy = "overall";
  protected isDuplicate = "";
  protected isBlurry = "";
  protected isSmiling = "";
  protected hasFace = "";

  emitChange() {
    this.filtersChange.emit({
      status: this.status,
      recommendation: this.recommendation,
      sortBy: this.sortBy,
      isDuplicate: this.isDuplicate,
      isBlurry: this.isBlurry,
      isSmiling: this.isSmiling,
      hasFace: this.hasFace,
    });
  }
}
