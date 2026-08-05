"use client"

import React, { useEffect } from "react"
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
import { ThemeToggle } from "@/components/ThemeToggle"
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
  useSidebar,
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
  const { setOpen, open } = useSidebar()

  // Auto-collapse sidebar when on project detail page (2-sidebar pattern)
  const isProjectDetailPage = /^\/projects\/[^/]+$/.test(pathname)

  useEffect(() => {
    if (isProjectDetailPage && open) {
      setOpen(false)
    }
  }, [isProjectDetailPage, open, setOpen])

  const isActive = (url: string): boolean => {
    if (url === "/") return pathname === "/"
    return pathname.startsWith(url)
  }

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
    >
      {/* ── Logo ───────────────────────────────────────────────────────── */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-glass-hover ring-1 ring-glass-border">
            <span className="text-sm font-bold text-foreground">A</span>
          </div>
          {/* Text hides when sidebar is collapsed (icon mode) */}
          <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold leading-none tracking-tight text-foreground">
              Anio Regalia
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Operating System
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <SidebarContent className="px-3 pt-4">
        {/* Primary */}
        <SidebarGroup className="p-0 mb-6">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {PRIMARY_NAV.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isActive(item.url)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5",
                      "text-sm font-medium",
                      "transition-all duration-150",
                      "text-muted-foreground",
                      "[&_svg]:size-5",
                      "hover:bg-secondary hover:text-foreground",
                      "data-[active=true]:bg-secondary data-[active=true]:text-foreground",
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
        <SidebarGroup className="p-0 mb-6">
          <SidebarGroupLabel className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:hidden">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {OPERATIONS_NAV.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isActive(item.url)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5",
                      "text-sm font-medium",
                      "transition-all duration-150",
                      "text-muted-foreground",
                      "[&_svg]:size-5",
                      "hover:bg-secondary hover:text-foreground",
                      "data-[active=true]:bg-secondary data-[active=true]:text-foreground",
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
          <SidebarGroupLabel className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:hidden">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {ACCOUNT_NAV.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isActive(item.url)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5",
                      "text-sm font-medium",
                      "transition-all duration-150",
                      "text-muted-foreground",
                      "[&_svg]:size-5",
                      "hover:bg-secondary hover:text-foreground",
                      "data-[active=true]:bg-secondary data-[active=true]:text-foreground",
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

      {/* ── Workspace switcher ─────────────────────────────────────────── */}
      <SidebarFooter className="px-3 pb-4 mt-auto">
        <div className="flex items-center justify-between px-3 mb-3">
          <ThemeToggle />
        </div>
        <div className="h-px bg-border mb-3" />
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
            "transition-colors duration-150",
            "hover:bg-secondary",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
            AR
          </div>

          <div className="flex flex-1 flex-col items-start gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium leading-none truncate text-foreground">
              Anio Regalia
            </span>
            <span className="text-[11px] leading-none truncate text-muted-foreground">
              Nairobi Atelier
            </span>
          </div>

          <HugeiconsIcon
            icon={ChevronDown}
            className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
          />
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
