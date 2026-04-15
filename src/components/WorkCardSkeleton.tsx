export const WorkCardSkeleton = () => (
  <div className="rounded-xl overflow-hidden bg-card border border-border/50 animate-pulse">
    <div className="aspect-[4/3] bg-muted" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-muted" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  </div>
);
