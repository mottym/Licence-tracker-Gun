"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

function base64UrlToUint8Array(base64UrlString: string) {
  const padding = "=".repeat((4 - (base64UrlString.length % 4)) % 4);
  const base64 = (base64UrlString + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushSubscribe() {
  const [status, setStatus] = useState("");

  const subscribe = async () => {
    if (!("serviceWorker" in navigator)) {
      setStatus("Browser push is not supported.");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus("Notification permission denied.");
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      setStatus("Missing VAPID public key.");
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    setStatus("Push notifications enabled.");
  };

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={subscribe}>
        Enable browser push
      </Button>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </div>
  );
}
