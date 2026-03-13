import { CommonModule } from "@angular/common";
import { Component, input, output } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-filter-bar",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="filter-bar-shell" [class.filter-bar-shell-embedded]="embedded()">
      <div class="filter-bar-header">
        <div class="filter-bar-summary">
          <span class="filter-bar-label">Smart filters</span>
          <strong>Showing {{ visibleCount() }} of {{ normalizedTotalCount() }} photos</strong>
          <span class="muted">
            {{ hasActiveFilters() ? "A custom filter or sort is active. Use Show all to reset everything." : "All photos are visible with the default sort." }}
          </span>
        </div>

        <button class="btn btn-secondary filter-reset" type="button" (click)="resetFilters()" [disabled]="!hasActiveFilters()">
          Show all
        </button>
      </div>

      <div class="filter-grid">
        <label class="field filter-field">
          <span>Status</span>
          <select class="filter-select" [(ngModel)]="status" (ngModelChange)="emitChange()">
            <option value="">All</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="needs_manual_review">Needs Manual Review</option>
            <option value="processing">Processing</option>
          </select>
        </label>

        <label class="field filter-field">
          <span>Recommended</span>
          <select class="filter-select" [(ngModel)]="recommendation" (ngModelChange)="emitChange()">
            <option value="">All</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="needs_manual_review">Manual Review</option>
          </select>
        </label>

        <label class="field filter-field">
          <span>Sort</span>
          <select class="filter-select" [(ngModel)]="sortBy" (ngModelChange)="emitChange()">
            <option value="overall">Overall Score</option>
            <option value="sharpness">Sharpness</option>
            <option value="smile">Smile Score</option>
            <option value="newest">Newest</option>
          </select>
        </label>

        <label class="field filter-field">
          <span>Duplicates</span>
          <select class="filter-select" [(ngModel)]="isDuplicate" (ngModelChange)="emitChange()">
            <option value="">Any</option>
            <option value="true">Only duplicates</option>
          </select>
        </label>

        <label class="field filter-field">
          <span>Blur</span>
          <select class="filter-select" [(ngModel)]="isBlurry" (ngModelChange)="emitChange()">
            <option value="">Any</option>
            <option value="true">Likely blurry</option>
          </select>
        </label>

        <label class="field filter-field">
          <span>Smiles</span>
          <select class="filter-select" [(ngModel)]="isSmiling" (ngModelChange)="emitChange()">
            <option value="">Any</option>
            <option value="true">Smiling faces</option>
          </select>
        </label>

        <label class="field filter-field">
          <span>Faces</span>
          <select class="filter-select" [(ngModel)]="hasFace" (ngModelChange)="emitChange()">
            <option value="">Any</option>
            <option value="true">Faces only</option>
          </select>
        </label>
      </div>
    </section>
  `,
  styles: [
    `
      .filter-bar-shell {
        display: grid;
        gap: 18px;
        padding: 18px 0 0;
      }

      .filter-bar-shell-embedded {
        padding-top: 0;
      }

      .filter-bar-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        gap: 16px;
        flex-wrap: wrap;
      }

      .filter-bar-summary {
        display: grid;
        gap: 4px;
      }

      .filter-bar-label {
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .filter-bar-summary strong {
        font-size: 1rem;
        line-height: 1.2;
      }

      .filter-reset {
        align-self: start;
        padding-inline: 20px;
      }

      .filter-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 14px;
      }

      .filter-field {
        gap: 6px;
      }

      .field span {
        font-weight: 600;
        font-size: 0.9rem;
      }

      .filter-select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding: 12px 44px 12px 14px;
        background-color: rgba(255, 255, 255, 0.84);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23816955' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 14px center;
        background-size: 16px;
      }

      .filter-select:focus {
        outline: 2px solid rgba(170, 90, 44, 0.15);
        outline-offset: 2px;
      }

      @media (max-width: 1180px) {
        .filter-grid {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }
      }

      @media (max-width: 1080px) {
        .filter-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }

      @media (max-width: 780px) {
        .filter-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 560px) {
        .filter-grid {
          grid-template-columns: 1fr;
        }

        .filter-reset {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
})
export class FilterBarComponent {
  readonly visibleCount = input<number>(0);
  readonly totalCount = input<number>(0);
  readonly embedded = input<boolean>(false);
  readonly filtersChange = output<Record<string, string>>();

  protected status = "";
  protected recommendation = "";
  protected sortBy = "overall";
  protected isDuplicate = "";
  protected isBlurry = "";
  protected isSmiling = "";
  protected hasFace = "";

  hasActiveFilters() {
    return Boolean(
      this.status ||
        this.recommendation ||
        this.isDuplicate ||
        this.isBlurry ||
        this.isSmiling ||
        this.hasFace ||
        this.sortBy !== "overall",
    );
  }

  normalizedTotalCount() {
    return Math.max(this.totalCount(), this.visibleCount());
  }

  resetFilters() {
    this.status = "";
    this.recommendation = "";
    this.sortBy = "overall";
    this.isDuplicate = "";
    this.isBlurry = "";
    this.isSmiling = "";
    this.hasFace = "";
    this.emitChange();
  }

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
