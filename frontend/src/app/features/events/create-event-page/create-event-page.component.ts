import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { EventService } from "../../../core/services/event.service";

@Component({
  selector: "app-create-event-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="section panel" style="padding: 28px;">
      <div class="stack">
        <div>
          <span class="badge">Create event</span>
          <h1>Create a review workspace</h1>
          <p class="muted">Set up an event first, then upload folders or batch image selections into the local pipeline.</p>
        </div>

        <form class="stack" [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <label class="field">
              <span>Event name</span>
              <input formControlName="eventName" placeholder="Riya & Karan Wedding" />
            </label>

            <label class="field">
              <span>Event type</span>
              <select formControlName="eventType">
                <option value="wedding">Wedding</option>
                <option value="engagement">Engagement</option>
                <option value="birthday">Birthday</option>
                <option value="corporate">Corporate</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <div class="actions">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid">Create Event</button>
          </div>
        </form>
      </div>
    </section>
  `,
})
export class CreateEventPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    eventName: ["", Validators.required],
    eventType: ["wedding", Validators.required],
  });

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.eventService.createEvent(this.form.getRawValue()).subscribe((event) => {
      this.router.navigate(["/events", event.id, "upload"]);
    });
  }
}
