import { Injectable, inject } from "@angular/core";

import { API_BASE_URL, ApiService } from "./api.service";
import { DuplicateGroup, EventItem, EventSummary, PhotoItem, UploadBatchResult } from "../models/types";

@Injectable({ providedIn: "root" })
export class EventService {
  private readonly api = inject(ApiService);

  listEvents() {
    return this.api.get<EventItem[]>("/events");
  }

  createEvent(payload: { eventName: string; eventType: string }) {
    return this.api.post<EventItem>("/events", payload);
  }

  deleteEvent(eventId: number) {
    return this.api.delete<void>(`/events/${eventId}`);
  }

  uploadPhotos(eventId: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append("photos", file, file.name));
    return fetch(`${API_BASE_URL}/events/${eventId}/upload`, {
      method: "POST",
      body: formData,
    }).then((response) => response.json() as Promise<UploadBatchResult>);
  }

  processEvent(eventId: string) {
    return this.api.post<{ id: string; status: string }>("/events/" + eventId + "/process", {});
  }

  getPhotos(eventId: string, searchParams: URLSearchParams = new URLSearchParams()) {
    const suffix = searchParams.toString() ? `?${searchParams}` : "";
    return this.api.get<PhotoItem[]>(`/events/${eventId}/photos${suffix}`);
  }

  getShortlisted(eventId: string) {
    return this.api.get<PhotoItem[]>(`/events/${eventId}/shortlisted`);
  }

  getRejected(eventId: string) {
    return this.api.get<PhotoItem[]>(`/events/${eventId}/rejected`);
  }

  getDuplicates(eventId: string) {
    return this.api.get<DuplicateGroup[]>(`/events/${eventId}/duplicates`);
  }

  getSummary(eventId: string) {
    return this.api.get<EventSummary>(`/events/${eventId}/summary`);
  }

  selectPhoto(photoId: number) {
    return this.api.patch<{ id: number; photo_id: number; source?: string }>(`/photos/${photoId}/select`, { source: "manual" });
  }

  unselectPhoto(photoId: number) {
    return this.api.patch<{ photoId: number; status: string; finalSelection: boolean }>(`/photos/${photoId}/unselect`, {});
  }

  rejectPhoto(photoId: number) {
    return this.api.patch<{ photoId: number; status: string }>(`/photos/${photoId}/reject`, {});
  }
}
