"use client"


import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/components/AuthProvider"
import type { Id } from "@convex/_generated/dataModel"

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  appointment: { bg: "#EDE8F5", text: "#5B3E96" },
  payment: { bg: "#E8F5E9", text: "#2E7D32" },
  project: { bg: "#FFF3E0", text: "#E65100" },
  system: { bg: "#F6F2EC", text: "#8C857D" },
}

export default function NotificationsPage() {
  const { user } = useAuth()

  const notifications = useQuery(
    api.notifications.listByRecipient,
    user?.id ? { recipientId: user.id } : "skip"
  )

  const markRead = useMutation(api.notifications.markRead)
  const markAllRead = useMutation(api.notifications.markAllRead)

  const isLoading = notifications === undefined
  const isEmpty = notifications !== undefined && notifications.length === 0

  const handleMarkAllRead = () => {
    if (!user) return
    markAllRead({ recipientId: user.id })
  }

  const handleMarkRead = (id: Id<"notifications">) => {
    markRead({ id })
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" style={{ background: "#F6F2EC" }}>
        <AppSidebar />
        <div className="flex-1">
          {/* Header */}
          <header
            className="sticky top-0 z-40 border-b backdrop-blur-sm"
            style={{
              height: 72,
              borderColor: "#E7E2DB",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h1
                  className="font-heading text-xl font-semibold"
                  style={{ color: "#1B1A17" }}
                >
                  Notifications
                </h1>
                {notifications && notifications.length > 0 && (
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-xs"
                    style={{ background: "#F6F2EC", color: "#8C857D" }}
                  >
                    {notifications.length}
                  </span>
                )}
              </div>
              {notifications && notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "#4B1E2A", background: "#F6F2EC" }}
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                  Mark all read
                </button>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Loading skeleton */}
            {isLoading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-[24px] border px-5 py-4"
                    style={{
                      background: "#FFFFFF",
                      borderColor: "#E7E2DB",
                      boxShadow: "0 2px 8px rgba(20,20,19,.06)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="size-8 rounded-full"
                        style={{ background: "#E7E2DB" }}
                      />
                      <div className="flex-1 space-y-2">
                        <div
                          className="h-4 w-3/4 rounded"
                          style={{ background: "#E7E2DB" }}
                        />
                        <div
                          className="h-3 w-1/3 rounded"
                          style={{ background: "#E7E2DB" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {isEmpty && (
              <div
                className="flex flex-col items-center justify-center rounded-[24px] border px-6 py-16 text-center"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#E7E2DB",
                  boxShadow: "0 2px 8px rgba(20,20,19,.06)",
                }}
              >
                <div
                  className="mb-4 flex size-12 items-center justify-center rounded-full"
                  style={{ background: "#F6F2EC" }}
                >
                  <HugeiconsIcon
                    icon={Notification03Icon}
                    className="size-6"
                    style={{ color: "#8C857D" }}
                  />
                </div>
                <p
                  className="font-heading text-lg font-medium"
                  style={{ color: "#1B1A17" }}
                >
                  No notifications
                </p>
                <p className="mt-2 max-w-sm text-sm" style={{ color: "#8C857D" }}>
                  You&apos;re all caught up. New notifications will appear here.
                </p>
              </div>
            )}

            {/* Notification list */}
            {!isLoading && !isEmpty && (
              <div className="flex flex-col gap-3">
                {notifications.map((notification) => {
                  const typeStyle = TYPE_COLORS[notification.type] ?? TYPE_COLORS.system
                  const isUnread = !notification.readAt

                  return (
                    <div
                      key={notification._id}
                      className="rounded-[24px] border px-5 py-4 transition-all"
                      style={{
                        background: isUnread ? "#FFFFFF" : "#FAFAF8",
                        borderColor: isUnread ? "#E7E2DB" : "#F0EDE7",
                        boxShadow: isUnread
                          ? "0 2px 8px rgba(20,20,19,.06)"
                          : "none",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Unread dot */}
                          <div className="flex size-8 shrink-0 items-center justify-center">
                            {isUnread && (
                              <div
                                className="size-2.5 rounded-full"
                                style={{ background: "#4B1E2A" }}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span
                                className="rounded-md px-2 py-0.5 text-xs font-medium capitalize"
                                style={{
                                  background: typeStyle.bg,
                                  color: typeStyle.text,
                                }}
                              >
                                {notification.type}
                              </span>
                              <span
                                className="font-mono text-xs"
                                style={{ color: "#8C857D" }}
                              >
                                {timeAgo(notification.createdAt)}
                              </span>
                            </div>
                            <p
                              className="text-sm"
                              style={{
                                color: isUnread ? "#1B1A17" : "#8C857D",
                              }}
                            >
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        {/* Mark read button */}
                        {isUnread && (
                          <button
                            onClick={() => handleMarkRead(notification._id)}
                            className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80"
                            style={{ color: "#4B1E2A", background: "#F6F2EC" }}
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
