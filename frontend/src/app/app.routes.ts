import { Routes } from "@angular/router";

import { CreateEventPageComponent } from "./features/events/create-event-page/create-event-page.component";
import { EventListPageComponent } from "./features/events/event-list-page/event-list-page.component";
import { ProjectDetailsPageComponent } from "./features/events/project-details-page/project-details-page.component";
import { ProcessingStatusPageComponent } from "./features/events/processing-status-page/processing-status-page.component";
import { SummaryPageComponent } from "./features/events/summary-page/summary-page.component";
import { UploadPageComponent } from "./features/events/upload-page/upload-page.component";
import { DuplicatesPageComponent } from "./features/review/duplicates-page/duplicates-page.component";
import { FinalSelectionPageComponent } from "./features/review/final-selection-page/final-selection-page.component";
import { ShortlistPageComponent } from "./features/review/shortlist-page/shortlist-page.component";

export const routes: Routes = [
  { path: "", component: EventListPageComponent },
  { path: "project-details", component: ProjectDetailsPageComponent },
  { path: "events/new", component: CreateEventPageComponent },
  { path: "events/:eventId/upload", component: UploadPageComponent },
  { path: "events/:eventId/processing", component: ProcessingStatusPageComponent },
  { path: "events/:eventId/shortlist", component: ShortlistPageComponent },
  { path: "events/:eventId/duplicates", component: DuplicatesPageComponent },
  { path: "events/:eventId/final-selection", component: FinalSelectionPageComponent },
  { path: "events/:eventId/summary", component: SummaryPageComponent },
];
