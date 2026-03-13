import { Component } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="page-shell">
      <header class="top-nav">
        <a routerLink="/" class="stack">
          <strong>MBRJ AI Photo Selector</strong>
          <span class="muted">Offline-first culling for wedding and event workflows</span>
        </a>

        <nav class="nav-links">
          <a class="nav-chip" routerLink="/">Events</a>
          <a class="nav-chip" routerLink="/events/new">Create Event</a>
        </nav>
      </header>

      <router-outlet></router-outlet>
    </div>
  `,
})
// TODO: Add a client-facing selection portal with restricted guest/client review access.
export class AppComponent {}
