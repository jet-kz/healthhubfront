"use client"

import { useState, useEffect, useCallback } from "react"

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "default"
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [])

  const subscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return
    
    try {
      const registration = await navigator.serviceWorker.ready
      // Note: You need a VAPID public key from your backend here
      // For now, we just register the service worker logic
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error("Push subscription error:", error)
    }
  }, [])

  useEffect(() => {
    if (permission === "granted") {
      subscribe()
    }
  }, [permission, subscribe])

  return { permission, requestPermission, subscription }
}
