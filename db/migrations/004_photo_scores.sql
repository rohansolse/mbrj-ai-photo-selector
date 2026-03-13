CREATE TABLE IF NOT EXISTS photo_scores (
  id BIGSERIAL PRIMARY KEY,
  photo_id BIGINT NOT NULL UNIQUE REFERENCES photos(id) ON DELETE CASCADE,
  sharpness_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  brightness_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  face_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  smile_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  eyes_open_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  composition_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  duplicate_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  ai_recommendation VARCHAR(40) NOT NULL DEFAULT 'needs_manual_review',
  model_version VARCHAR(120) NOT NULL DEFAULT 'v1-placeholder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photo_scores_overall ON photo_scores(overall_score DESC);
