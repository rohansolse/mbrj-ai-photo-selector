import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-project-details-page",
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section hero-grid">
      <article class="panel hero-main">
        <div class="eyebrow-row">
          <span class="badge">Offline-first AI culling</span>
          <span class="hero-inline-note">Local scoring • Duplicate grouping • Manual review ready</span>
        </div>

        <div class="stack">
          <h1 class="hero-title">Structured photo culling for weddings, events, and large album workflows.</h1>
          <p class="hero-copy">
            Upload an event, process the full batch locally, collapse burst sequences, and surface the strongest frames before the final human pass.
          </p>
        </div>

        <div class="actions">
          <a class="btn btn-primary" routerLink="/events/new">Create Event</a>
          <a class="btn btn-secondary" routerLink="/">Open Events</a>
        </div>
      </article>

      <aside class="hero-side">
        <article class="panel side-card">
          <span class="side-label">Pipeline</span>
          <strong>Upload -> analyze -> deduplicate -> shortlist -> final select</strong>
          <p class="muted">Async background processing keeps uploads responsive while local scoring runs.</p>
        </article>

        <article class="panel side-card">
          <span class="side-label">Scoring v1</span>
          <strong>Sharpness, brightness, portrait quality, smile/eyes, composition</strong>
          <p class="muted">Duplicates and blur are penalized before shortlist decisions are applied.</p>
        </article>

        <article class="panel side-card">
          <span class="side-label">Storage</span>
          <strong>Local originals + PostgreSQL metadata</strong>
          <p class="muted">No cloud vision dependency. Keep the architecture ready for stronger local models later.</p>
        </article>
      </aside>
    </section>

    <section class="section kpi-strip">
      <article class="panel kpi-card">
        <span class="side-label">Capture flow</span>
        <strong>Import -> score -> review</strong>
        <p class="muted">Move from upload to shortlist without leaving the workspace.</p>
      </article>

      <article class="panel kpi-card">
        <span class="side-label">Workflow mode</span>
        <strong>Offline-first</strong>
        <p class="muted">Designed for local storage and local image analysis.</p>
      </article>

      <article class="panel kpi-card">
        <span class="side-label">Review flow</span>
        <strong>AI shortlist + manual override</strong>
        <p class="muted">Duplicates, shortlist, and final selection stay in one review path.</p>
      </article>
    </section>
  `,
})
export class ProjectDetailsPageComponent {}
