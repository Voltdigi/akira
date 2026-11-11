/**
 * Server-only Pusher Beams wiring (publishes notifications). Never import
 * this from a "use client" component — it reads the secret server key.
 */
import PushNotifications from "@pusher/push-notifications-server";

let client: PushNotifications | null = null;

function getClient(): PushNotifications {
  if (!client) {
    const instanceId = process.env.NEXT_PUBLIC_PUSHER_INSTANCE_ID;
    const secretKey = process.env.PUSHER_SERVER_KEY;
    if (!instanceId || !secretKey) {
      throw new Error("Missing NEXT_PUBLIC_PUSHER_INSTANCE_ID or PUSHER_SERVER_KEY env vars");
    }
    client = new PushNotifications({ instanceId, secretKey });
  }
  return client;
}

/** Publishes a push notification to every device subscribed to this child's alerts. */
export async function publishToChild(
  childId: string,
  notification: { title: string; body: string }
): Promise<void> {
  const beams = getClient();
  await beams.publishToInterests([`child-${childId}`], {
    web: {
      notification: {
        title: notification.title,
        body: notification.body,
      },
    },
  });
}
