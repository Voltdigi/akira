export type FeedType = "breast" | "bottle";

export interface Feed {
  id: string;
  /** Epoch milliseconds of the feed. */
  time: number;
  type: FeedType;
  /** Amount in ml for bottle feeds; null for breast feeds. */
  ml: number | null;
}
