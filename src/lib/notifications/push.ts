import webpush from "web-push";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:support@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

interface PushInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
}

export async function sendPushNotification(input: PushInput) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return { ok: false, message: "Missing VAPID keys" };
  }

  await webpush.sendNotification(
    {
      endpoint: input.endpoint,
      keys: {
        p256dh: input.p256dh,
        auth: input.auth,
      },
    },
    JSON.stringify({
      title: input.title,
      body: input.body,
    }),
  );

  return { ok: true };
}
