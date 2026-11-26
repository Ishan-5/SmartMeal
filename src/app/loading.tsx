export default function Loading() {
  return (
    <main id="main-content" className="min-h-screen bg-cream">
      <div className="shell h-[72px] animate-pulse border-b border-moss/10" />
      <div className="shell grid gap-8 py-10 lg:grid-cols-[1fr_300px] lg:py-14">
        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse rounded-full bg-mint" />
          <div className="h-10 w-3/4 animate-pulse rounded-full bg-mint/70" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-mint/50" />
          <div className="mt-8 h-72 animate-pulse rounded-4xl bg-paper" />
        </div>
        <div className="h-64 animate-pulse rounded-4xl bg-paper" />
      </div>
    </main>
  );
}
