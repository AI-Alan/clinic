export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-12 w-12 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--color-primary)]"
          aria-hidden
        />
        <p className="text-base font-bold text-gray-700">Loading…</p>
      </div>
    </div>
  )
}
