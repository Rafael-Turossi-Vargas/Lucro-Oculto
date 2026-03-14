export function Skeleton({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ background: "var(--bg-subtle)", ...style }}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton style={{ width: 160, height: 28 }} />
          <Skeleton style={{ width: 220, height: 16 }} />
        </div>
        <Skeleton style={{ width: 140, height: 40, borderRadius: 12 }} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-5 space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between">
              <Skeleton style={{ width: 100, height: 14 }} />
              <Skeleton style={{ width: 16, height: 16, borderRadius: 4 }} />
            </div>
            <Skeleton style={{ width: 120, height: 28 }} />
            <Skeleton style={{ width: 80, height: 12 }} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <Skeleton style={{ width: 120, height: 16 }} />
          <Skeleton className="mx-auto" style={{ width: 112, height: 112, borderRadius: "50%" }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 8 }} />
          ))}
        </div>
        <div className="lg:col-span-2 rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <Skeleton style={{ width: 200, height: 16 }} />
          <Skeleton style={{ height: 200 }} />
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <Skeleton style={{ width: 160, height: 18 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
          <div className="flex-1 space-y-2">
            <Skeleton style={{ height: 14 }} />
            <Skeleton style={{ width: "70%", height: 12 }} />
          </div>
          <Skeleton style={{ width: 80, height: 16, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  )
}
