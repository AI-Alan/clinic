export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
          aria-hidden
        />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  )
}
