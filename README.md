# mbrj-ai-photo-selector

Offline-first AI photo selection workflow for wedding and event albums. The stack is split into an Angular frontend, a Node.js + Express backend, PostgreSQL metadata storage, and local filesystem storage for originals and thumbnails. No Google Vision, AWS Rekognition, Azure Vision, or any paid cloud vision service is used.

## What it does

- Creates event workspaces for weddings, engagements, birthdays, and other shoots
- Uploads large batches of `jpg`, `jpeg`, `png`, and `webp` files
- Stores originals and thumbnails locally under `backend/uploads/events/{eventId}`
- Saves image metadata, scores, duplicate groups, and final selections in PostgreSQL
- Runs an async local analysis pipeline for:
  - blur / sharpness
  - brightness / exposure
  - duplicate / burst grouping
  - portrait heuristics
  - composition heuristics
  - TensorFlow-ready image quality scoring
- Produces AI recommendations:
  - `shortlisted`
  - `rejected`
  - `needs_manual_review`
- Provides Angular review screens for shortlist review, duplicate review, and manual final selection

## Tech stack

- Frontend: Angular standalone app
- Backend: Node.js + Express
- Database: PostgreSQL
- Image processing: OpenCV-ready adapter with Sharp fallback heuristics
- ML scoring: TensorFlow-ready local service with placeholder model loading
- Storage: local filesystem + PostgreSQL

## Monorepo structure

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── middleware
│   │   ├── modules
│   │   │   ├── duplicates
│   │   │   ├── events
│   │   │   ├── faces
│   │   │   ├── images
│   │   │   ├── jobs
│   │   │   ├── scoring
│   │   │   ├── selection
│   │   │   └── upload
│   │   ├── routes
│   │   └── utils
│   └── uploads
├── db
│   ├── migrations
│   └── seeds
├── docs
├── frontend
│   └── src/app
└── docker-compose.yml
```

## Scoring strategy v1

`overall_score =`

- `35% sharpness`
- `15% brightness`
- `20% face / portrait quality`
- `15% smile / eyes`
- `15% composition`

Then:

- penalize obvious blur
- penalize duplicate burst groups
- reject very blurry photos
- reject dark / overexposed photos
- keep only the top-ranked frame from a duplicate group
- prefer smiling, eyes-open portraits when faces are present

## Backend API

- `POST /api/events`
- `POST /api/events/:eventId/upload`
- `POST /api/events/:eventId/process`
- `GET /api/events/:eventId/photos`
- `GET /api/events/:eventId/shortlisted`
- `GET /api/events/:eventId/rejected`
- `GET /api/events/:eventId/duplicates`
- `PATCH /api/photos/:photoId/select`
- `PATCH /api/photos/:photoId/reject`
- `GET /api/events/:eventId/summary`

## Database schema

Migration-ready SQL lives in [`db/migrations`](/Users/rohansolse/Documents/mbrj-ai-photo-selector/db/migrations).

Tables:

- `events`
- `photos`
- `photo_scores`
- `duplicate_groups`
- `final_selections`

The backend also stores `duplicate_group_id` on `photos` and `model_version` on `photo_scores` to support processing and future model iteration.

## Exact local run instructions

### 1. Install dependencies

From the repo root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Notes:

- `opencv4nodejs` is declared as an optional dependency. If it does not build on your machine, the current starter still runs with Sharp-based fallback heuristics.
- TensorFlow support is wired through `@tensorflow/tfjs-node`. The current project works with its placeholder scoring flow even before you add a trained local model.

### 2. Configure environment files

Create env files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Important backend variables:

- `DATABASE_URL`
- `PORT`
- `FRONTEND_URL`
- `UPLOAD_ROOT`
- `SHORTLIST_PERCENTAGE`
- `SHORTLIST_MAX_COUNT`
- `TF_MODEL_PATH`
- `AI_MODEL_VERSION`

The Angular app currently defaults to `http://localhost:4000/api`. If you need a different API host, inject `window.__env.NG_APP_API_BASE_URL` or adjust the frontend base URL constant.

### 3. Start PostgreSQL

Using Docker:

```bash
docker compose up -d
```

### 4. Run migrations

```bash
npm run migrate
```

### 5. Start the backend

```bash
npm run dev:backend
```

Backend default URL: `http://localhost:4000`

### 6. Start the frontend

In a second terminal:

```bash
npm run dev:frontend
```

Frontend default URL: `http://localhost:4200`

### 7. Run both together

```bash
npm run dev
```

## Processing pipeline

1. Create an event
2. Upload a batch of photos
3. Trigger `POST /api/events/:eventId/process`
4. Job queue marks photos through statuses:
   - `uploaded`
   - `processing`
   - `scored`
   - `shortlisted`
   - `failed`
5. Duplicate grouping and selection logic promote top images and reject weaker duplicate frames
6. Review results in the Angular UI

## Frontend pages

- Event list
- Create event
- Upload photos
- Processing status
- AI shortlist gallery
- Duplicate review gallery
- Final selection gallery
- Summary dashboard

## AI module design notes

- `backend/src/modules/images/services/opencv.service.js`
  - OpenCV Laplacian variance blur scoring when OpenCV is available
  - Sharp fallback when OpenCV is unavailable
- `backend/src/modules/scoring/services/tensorflow.service.js`
  - loads a local TensorFlow model if `TF_MODEL_PATH` is configured
  - otherwise returns a placeholder aesthetic score with confidence and model version
- `backend/src/modules/faces/services/faces.service.js`
  - currently heuristic-driven and intentionally isolated for later replacement with a local detector

## Current extension points

- swap heuristic face logic for local OpenCV / DNN detection
- replace placeholder TensorFlow scoring with a trained in-house aesthetic model
- improve duplicate detection with feature matching embeddings
- add richer EXIF parsing for true capture time ordering
- persist jobs in PostgreSQL or Redis instead of memory

## TODOs already marked in code

- custom wedding aesthetic model
- bride/groom detection
- client-facing selection portal
- edited vs raw workflow
- Lightroom/export integration

See [`docs/architecture.md`](/Users/rohansolse/Documents/mbrj-ai-photo-selector/docs/architecture.md) for module boundaries and extension guidance.
