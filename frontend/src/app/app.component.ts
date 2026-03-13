import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { filter } from "rxjs";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <div class="page-shell">
        <header class="top-nav panel">
          <a routerLink="/" class="brand-block">
            <span class="brand-kicker">MBRJ Studio Tools</span>
            <strong class="brand-title">AI Photo Selector</strong>
            <span class="brand-subtitle">Offline-first culling for wedding and event workflows</span>
          </a>

          <nav class="nav-links">
            <a
              class="nav-chip"
              routerLink="/project-details"
              routerLinkActive="nav-chip-active"
            >
              Project Details
            </a>
            <a
              class="nav-chip"
              routerLink="/"
              routerLinkActive="nav-chip-active"
            >
              Events
            </a>
            <a
              class="nav-chip nav-chip-primary"
              routerLink="/events/new"
              routerLinkActive="nav-chip-active"
            >
              Create Event
            </a>
          </nav>
        </header>

        <section class="workspace-nav panel" *ngIf="activeEventId() as eventId">
          <div class="workspace-nav-copy">
            <span class="workspace-nav-label">Event workspace</span>
            <span class="workspace-nav-id">Event {{ eventId }}</span>
          </div>

          <nav class="workspace-links">
            <a class="nav-chip" [routerLink]="['/events', eventId, 'upload']" routerLinkActive="nav-chip-active">Upload</a>
            <a class="nav-chip" [routerLink]="['/events', eventId, 'processing']" routerLinkActive="nav-chip-active">Processing</a>
            <a class="nav-chip" [routerLink]="['/events', eventId, 'shortlist']" routerLinkActive="nav-chip-active">Shortlist</a>
            <a class="nav-chip" [routerLink]="['/events', eventId, 'duplicates']" routerLinkActive="nav-chip-active">Duplicates</a>
            <a class="nav-chip" [routerLink]="['/events', eventId, 'final-selection']" routerLinkActive="nav-chip-active">Final Selection</a>
            <a class="nav-chip" [routerLink]="['/events', eventId, 'summary']" routerLinkActive="nav-chip-active">Summary</a>
          </nav>
        </section>

        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .workspace-nav {
        margin-top: 16px;
        padding: 16px 22px;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: 16px 24px;
      }

      .workspace-nav-copy {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 12px;
      }

      .workspace-nav-label {
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .workspace-nav-id {
        color: var(--muted);
        font-weight: 600;
      }

      .workspace-links {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: end;
      }

      @media (max-width: 960px) {
        .workspace-nav {
          grid-template-columns: 1fr;
        }

        .workspace-links {
          justify-content: start;
        }
      }
    `,
  ],
})
// TODO: Add a client-facing selection portal with restricted guest/client review access.
export class AppComponent {
  private readonly router = inject(Router);
  protected readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }

  activeEventId() {
    const match = this.currentUrl().match(/^\/events\/([^/]+)\/(upload|processing|shortlist|duplicates|final-selection|summary)$/);
    return match?.[1] || "";
  }
}
