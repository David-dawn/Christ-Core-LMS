export default function AdminLoading() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading admin dashboard">
      <div className="glass h-28 animate-pulse rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass h-28 animate-pulse rounded-2xl" />
        ))}
      </div>
      <div className="glass h-80 animate-pulse rounded-2xl" />
    </div>
  );
}
