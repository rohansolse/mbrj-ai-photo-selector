# Architecture Notes

## Backend

- `events`
  - event creation and top-level event queries
- `upload`
  - multipart upload handling, local storage, thumbnail generation
- `images`
  - image metadata access plus OpenCV/Sharp analysis
- `faces`
  - local face-related heuristics and future detector integration point
- `scoring`
  - weighted score calculation, TensorFlow model adapter, recommendation labeling
- `duplicates`
  - perceptual hashing and duplicate group creation
- `selection`
  - shortlist/reject/manual override rules plus summary queries
- `jobs`
  - async in-memory processing queue

## Frontend

- `core`
  - API access and shared domain models
- `features/events`
  - event creation, upload, processing, and summary flows
- `features/review`
  - shortlist review, duplicate review, and final manual selection
- `shared/components`
  - reusable gallery cards, filter controls, and stat cards

## Offline-first design

- originals and thumbnails stay on local disk
- PostgreSQL stores paths, scores, flags, and review state
- image analysis runs locally in the backend process
- cloud vision APIs are intentionally excluded from the architecture

## Next practical upgrades

- persist job queue state in PostgreSQL
- add EXIF parsing for camera metadata and burst timing
- train a custom wedding aesthetic scoring model
- add subject-specific models for ceremony moments and portrait quality
- add export adapters for Lightroom or delivery pipelines
