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
}
