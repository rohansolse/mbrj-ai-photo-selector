import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
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
              [routerLinkActiveOptions]="{ exact: true }"
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

        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
// TODO: Add a client-facing selection portal with restricted guest/client review access.
export class AppComponent {}
