"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function usePushNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      registerServiceWorker();
      checkSubscription();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      await navigator.serviceWorker.register("/notification-sw.js");
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/sw-pwa.js");
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Simpan subscription ke database (tanpa user_id)
      const { error } = await supabase.from("push_subscriptions").upsert({
        id: crypto.randomUUID(),
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setIsSubscribed(true);
      setPermission("granted");
      return true;
    } catch (error) {
      console.error("Subscription failed:", error);
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Hapus subscription dari database
        const { error } = await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);

        if (error) throw error;

        await subscription.unsubscribe();
        setIsSubscribed(false);
        setPermission("denied");
      }
      return true;
    } catch (error) {
      console.error("Unsubscription failed:", error);
      return false;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      alert("Browser Anda tidak mendukung push notification");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      return await subscribe();
    }
    return false;
  }, [isSupported, subscribe]);

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    checkSubscription,
  };
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
