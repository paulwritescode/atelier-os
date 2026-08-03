import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Anio Regalia
        </p>
        <h1 className="font-heading mb-4 text-6xl font-light text-foreground">404</h1>
        <p className="mb-8 text-muted-foreground">This page does not exist.</p>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-primary bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
