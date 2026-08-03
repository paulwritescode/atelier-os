"use client"

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react"

interface StaffSession {
  id: string
  name: string
  role: string
}

interface AuthContextValue {
  user: StaffSession | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (session: StaffSession) => void
  signOut: () => void
}

const SESSION_KEY = "anio-session"

/* ── External store over localStorage ──────────────────────────────────────
 * Using useSyncExternalStore rather than an effect keeps the read out of
 * render (react-hooks/purity) and gives cross-tab sync for free: signing out
 * in one tab updates every other tab.
 * ------------------------------------------------------------------------ */

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  // Fires when another tab writes to localStorage.
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

// Cached so getSnapshot returns a stable reference while the raw string is
// unchanged — otherwise React would loop on every render.
let cachedRaw: string | null = null
let cachedSession: StaffSession | null = null

function getSnapshot(): StaffSession | null {
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (raw === cachedRaw) return cachedSession

  cachedRaw = raw
  if (!raw) {
    cachedSession = null
    return null
  }
  try {
    cachedSession = JSON.parse(raw) as StaffSession
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
    cachedSession = null
  }
  return cachedSession
}

/** No session during SSR — localStorage does not exist on the server. */
function getServerSnapshot(): StaffSession | null {
  return null
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: () => {},
  signOut: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Once hydrated, useSyncExternalStore has the real value, so there is no
  // separate loading phase to track.
  const isLoading = false

  const signIn = useCallback((session: StaffSession) => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    emit()
  }, [])

  const signOut = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY)
    emit()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
