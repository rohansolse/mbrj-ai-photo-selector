export interface EventItem {
  id: number;
  event_name: string;
  event_type: string;
  created_at: string;
  total_photos?: number;
}

export interface PhotoItem {
  id: number;
  event_id: number;
  file_name: string;
  original_path: string;
  thumbnail_path: string;
  status: string;
  overall_score?: number;
  sharpness_score?: number;
  smile_score?: number;
  eyes_open_score?: number;
  brightness_score?: number;
  face_score?: number;
  composition_score?: number;
  ai_recommendation?: string;
  group_key?: string | null;
  is_duplicate?: boolean;
}

export interface DuplicateGroup {
  id: number;
  group_key: string;
  photo_count: number;
  photos: Array<Pick<PhotoItem, "id" | "file_name" | "thumbnail_path" | "status">>;
}

export interface EventSummary {
  event_id: number;
  event_name: string;
  event_type: string;
  total_uploaded: number;
  shortlisted_count: number;
  rejected_count: number;
  duplicate_groups_count: number;
  average_score: number;
  top_score: number;
  score_distribution?: Record<string, number>;
}
