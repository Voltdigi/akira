"use client";

/**
 * Browser-side Pusher Beams wiring. Each child profile maps 1:1 to a Beams
 * Device Interest named `child-<id>` — any device that's enabled push for
 * that child subscribes to it, and the server publishes to that interest
 * name without needing to track individual device tokens itself.
 */
import * as PusherPushNotifications from "@pusher/push-notifications-web";

let client: PusherPushNotifications.Client | null = null;

function getClient(): PusherPushNotifications.Client | null {
  if (typeof window === "undefined") return null;
  const instanceId = process.env.NEXT_PUBLIC_PUSHER_INSTANCE_ID;
  if (!instanceId) return null;
  if (!client) client = new PusherPushNotifications.Client({ instanceId });
  return client;
}

function interestFor(childId: string): string {
  return `child-${childId}`;
}

/** Requests browser notification permission (if needed) and subscribes this device to the child's alerts. */
export async function enablePushForChild(childId: string): Promise<{ error: string | null }> {
  try {
    const beams = getClient();
    if (!beams) return { error: "Push notifications are not configured for this app yet." };
    await beams.start();
    await beams.addDeviceInterest(interestFor(childId));
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to enable push notifications." };
  }
}

export async function disablePushForChild(childId: string): Promise<{ error: string | null }> {
  try {
    const beams = getClient();
    if (!beams) return { error: null };
    // push_enabled in the DB is account-wide, but Beams registration is
    // per-device/per-browser - a device that never called .start() (e.g.
    // this is a different browser than the one that first turned push on)
    // has nothing to remove. Treat that as a no-op instead of surfacing
    // "SDK not registered with Beams" as a user-facing error.
    const state = await beams.getRegistrationState();
    const notRegistered =
      state === PusherPushNotifications.RegistrationState.PERMISSION_PROMPT_REQUIRED ||
      state === PusherPushNotifications.RegistrationState.PERMISSION_DENIED ||
      state === PusherPushNotifications.RegistrationState.PERMISSION_GRANTED_NOT_REGISTERED_WITH_BEAMS;
    if (notRegistered) return { error: null };
    await beams.removeDeviceInterest(interestFor(childId));
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to disable push notifications." };
  }
}
