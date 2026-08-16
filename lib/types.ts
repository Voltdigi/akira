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

export interface Child {
  id: string;
  user_id: string;
  name: string;
  birthdate: string | null; // "YYYY-MM-DD"
  height_cm: number | null;
  weight_kg: number | null;
  created_at: string;
  updated_at: string;
}
