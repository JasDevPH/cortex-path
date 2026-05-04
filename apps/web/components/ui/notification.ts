"use client"

import { toast } from "sonner"

interface NotificationProps {
  type?: "success" | "error" | "info" | "warning"
  message?: string
}

export function notification({ type = "info", message = "" }: Readonly<NotificationProps>) {
  if (!message) return

  switch (type) {
    case "success":
      toast.success(message)
      break
    case "error":
      toast.error(message)
      break
    case "warning":
      toast.warning(message)
      break
    default:
      toast(message)
  }
}