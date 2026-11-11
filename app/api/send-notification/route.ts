import { NextRequest, NextResponse } from "next/server";
import { publishToChild } from "@/lib/beamsServer";

/**
 * Generic push-notification sender, shared by any future alert trigger
 * (missed feed today; medication/sleep once KAN-1/KAN-2 exist). Protected
 * by a shared secret header — this is server-to-server only, never called
 * directly from the browser.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-api-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { childId?: string; title?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { childId, title, message } = body;
  if (!childId || !title || !message) {
    return NextResponse.json({ error: "childId, title and message are required" }, { status: 400 });
  }

  try {
    await publishToChild(childId, { title, body: message });
    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Failed to publish notification:", error);
    return NextResponse.json({ error: "Failed to publish notification" }, { status: 500 });
  }
}
