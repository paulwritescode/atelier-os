"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home,
  User,
  Bell,
  Settings,
  Briefcase,
  Users,
  Calendar,
  Scissors,
  Clock,
  CreditCard,
  FileText,
  ChevronDown,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
}

const PRIMARY_NAV: NavItem[] = [
  { title: "Dashboard",  url: "/",            icon: Home      },
  { title: "Projects",   url: "/projects",    icon: Briefcase },
  { title: "Clients",    url: "/clients",     icon: Users     },
  { title: "Calendar",   url: "/calendar",    icon: Calendar  },
]

const OPERATIONS_NAV: NavItem[] = [
  { title: "Production",    url: "/production",    icon: Scissors  },
  { title: "Appointments",  url: "/appointments",  icon: Clock     },
  { title: "Payments",      url: "/payments",      icon: CreditCard },
  { title: "Documents",     url: "/documents",     icon: FileText  },
]

const ACCOUNT_NAV: NavItem[] = [
  { title: "Profile",        url: "/profile",        icon: User     },
  { title: "Notifications",  url: "/notifications",  icon: Bell     },
  { title: "Settings",       url: "/settings",       icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (url: string): boolean => {
    if (url === "/") return pathname === "/"
    return pathname.startsWith(url)
  }

  return (
    <Sidebar
      className={cn(
        // Deep burgundy background — v2 spec: sidebar is the identity of the atelier
        "border-r-0",
        "[&>div]:bg-[#4B1E2A]",
      )}
    >
      {/* ── Logo / wordmark ────────────────────────────────────────────── */}
      <SidebarHeader
        className="px-6 pt-8 pb-0"
        style={{ background: "transparent" }}
      >
        <div className="flex flex-col gap-1">
          <span
            className="font-heading text-xl font-semibold leading-none tracking-tight"
            style={{ color: "#FFFFFF" }}
          >
            Anio Regalia
          </span>
          <span
            className="text-[11px] font-medium uppercase tracking-[0.08em]"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Operating System
          </span>
        </div>
      </SidebarHeader>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <SidebarContent
        className="px-3 pt-8"
        style={{ background: "transparent" }}
      >
        {/* Primary — no group label, top-level */}
        <SidebarGroup className="p-0 mb-12">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {PRIMARY_NAV.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isActive(item.url)}
                    className={cn(
                      // Base — inactive
                      "flex items-center gap-3 h-[44px] px-5 rounded-xl",
                      "text-[15px] font-[450] leading-none",
                      "transition-colors duration-150",
                      // Inactive colours
                      "text-[#E8E1D6]",
                      "[&_svg]:text-[#8E8072] [&_svg]:size-5",
                      // Hover
                      "hover:bg-white/[0.04] hover:text-white [&:hover_svg]:text-[#C8A46B]",
                      // Active — rgba(255,255,255,0.08) bg, white text, gold icon
                      "data-[active=true]:bg-white/[0.08] data-[active=true]:text-white",
                      "[&[data-active=true]_svg]:text-[#C8A46B]",
                    )}
                  >
                    <HugeiconsIcon icon={item.icon} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations */}
        <SidebarGroup className="p-0 mb-12">
          {/* Gold section label — v2 spec */}
          <SidebarGroupLabel
            className="px-5 mb-3 text-[11px] font-[600] uppercase tracking-[0.08em]"
            style={{ color: "#C8A46B" }}
          >
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {OPERATIONS_NAV.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isActive(item.url)}
                    className={cn(
                      "flex items-center gap-4 h-12 px-5 rounded-2xl",
                      "text-[16px] font-[500] leading-none",
                      "transition-colors duration-150",
                      "text-white/80",
                      "[&_svg]:text-white/70 [&_svg]:size-5",
                      "hover:bg-[#5C1525] hover:text-white [&:hover_svg]:text-white",
                      "data-[active=true]:bg-[#5C1525] data-[active=true]:text-white",
                      "[&[data-active=true]_svg]:text-white",
                    )}
                  >
                    <HugeiconsIcon icon={item.icon} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel
            className="px-5 mb-3 text-[11px] font-[600] uppercase tracking-[0.08em]"
            style={{ color: "#C8A46B" }}
          >
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {ACCOUNT_NAV.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isActive(item.url)}
                    className={cn(
                      "flex items-center gap-4 h-12 px-5 rounded-2xl",
                      "text-[16px] font-[500] leading-none",
                      "transition-colors duration-150",
                      "text-white/80",
                      "[&_svg]:text-white/70 [&_svg]:size-5",
                      "hover:bg-[#5C1525] hover:text-white [&:hover_svg]:text-white",
                      "data-[active=true]:bg-[#5C1525] data-[active=true]:text-white",
                      "[&[data-active=true]_svg]:text-white",
                    )}
                  >
                    <HugeiconsIcon icon={item.icon} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Atelier workspace switcher — bottom of sidebar ─────────────── */}
      <SidebarFooter
        className="px-3 pb-8 mt-auto"
        style={{ background: "transparent" }}
      >
        {/* Subtle divider */}
        <div
          className="mb-4 h-px w-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        {/* Workspace card */}
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl px-4 py-3",
            "transition-colors duration-150",
            "hover:bg-white/[0.04]",
          )}
        >
          {/* Avatar */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
            style={{ background: "#C8A46B", color: "#4B1E2A" }}
          >
            AR
          </div>

          {/* Name + workspace */}
          <div className="flex flex-1 flex-col items-start gap-0.5 overflow-hidden">
            <span
              className="text-[14px] font-[500] leading-none truncate"
              style={{ color: "#FFFFFF" }}
            >
              Anio Regalia
            </span>
            <span
              className="text-[12px] leading-none truncate"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Nairobi Atelier
            </span>
          </div>

          <HugeiconsIcon
            icon={ChevronDown}
            className="size-4 shrink-0"
            style={{ color: "rgba(255,255,255,0.40)" }}
          />
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
