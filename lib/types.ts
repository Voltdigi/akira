export type FeedType = "breast" | "bottle";

export interface Feed {
  id: string;
  /** Epoch milliseconds of the feed. */
  time: number;
  type: FeedType;
  /** Amount in ml for bottle feeds; null for breast feeds. */
  ml: number | null;
  /** Whether a bottle feed was formula; null for breast feeds. */
  is_formula: boolean | null;
  /** Duration in seconds for breast feeds; null for bottle feeds. */
  duration_sec: number | null;
  /** Child profile ID this feed belongs to. */
  child_id: string;
}

export type AlertType = "missed_feed" | "medication" | "sleep";

export interface AlertPreferences {
  child_id: string;
  push_enabled: boolean;
  missed_feed_enabled: boolean;
  missed_feed_threshold_hours: number;
  /** Not yet actionable — no chamber exists to trigger these (KAN-2). */
  medication_enabled: boolean;
  /** Not yet actionable — no chamber exists to trigger these (KAN-1). */
  sleep_enabled: boolean;
  updated_at: string;
}

export interface AlertLog {
  id: string;
  child_id: string;
  type: AlertType;
  title: string;
  message: string;
  triggered_at: string;
  seen: boolean;
  created_at: string;
}

export interface Child {
  id: string;
  user_id: string;
  name: string;
  birthdate: string | null; // "YYYY-MM-DD"
  height_cm: number | null;
  weight_kg: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}
