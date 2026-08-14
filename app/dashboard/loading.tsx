export default function DashboardLoading() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="glass h-44 animate-pulse rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass h-28 animate-pulse rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="glass h-72 animate-pulse rounded-2xl" />
        <div className="grid gap-6">
          <div className="glass h-56 animate-pulse rounded-2xl" />
          <div className="glass h-40 animate-pulse rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
