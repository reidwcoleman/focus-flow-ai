/**
 * Loading Skeleton Components
 * Smooth loading states to prevent jumpy UI
 */

export const AssignmentSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-start gap-3 p-4 rounded-xl bg-dark-bg-secondary border border-dark-border-glow">
      <div className="w-5 h-5 bg-dark-bg-tertiary rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-dark-bg-tertiary rounded w-3/4"></div>
        <div className="flex gap-2">
          <div className="h-3 bg-dark-bg-tertiary rounded w-20"></div>
          <div className="h-3 bg-dark-bg-tertiary rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>
)

export const NoteSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-dark-bg-secondary rounded-2xl p-4 border border-dark-border-glow">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-dark-bg-tertiary rounded w-32"></div>
        <div className="h-8 w-8 bg-dark-bg-tertiary rounded-lg"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-dark-bg-tertiary rounded w-full"></div>
        <div className="h-3 bg-dark-bg-tertiary rounded w-5/6"></div>
        <div className="h-3 bg-dark-bg-tertiary rounded w-4/6"></div>
      </div>
    </div>
  </div>
)

export const ActivitySkeleton = () => (
  <div className="animate-pulse">
    <div className="p-3 rounded-xl bg-dark-bg-tertiary border border-dark-border-glow">
      <div className="flex items-start gap-2.5">
        <div className="w-4 h-4 bg-dark-bg-secondary rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-dark-bg-secondary rounded w-3/4"></div>
          <div className="flex gap-2">
            <div className="h-3 bg-dark-bg-secondary rounded w-16"></div>
            <div className="h-3 bg-dark-bg-secondary rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export const StatCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-dark-bg-secondary rounded-xl p-2.5 border border-dark-border-glow">
      <div className="h-3 bg-dark-bg-tertiary rounded w-16 mb-1"></div>
      <div className="h-6 bg-dark-bg-tertiary rounded w-12"></div>
    </div>
  </div>
)

export const CalendarSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-dark-bg-secondary rounded-2xl p-4 border border-dark-border-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-dark-bg-tertiary rounded w-32"></div>
        <div className="flex gap-1.5">
          <div className="w-8 h-8 bg-dark-bg-tertiary rounded-lg"></div>
          <div className="w-8 h-8 bg-dark-bg-tertiary rounded-lg"></div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square bg-dark-bg-tertiary rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
)

export const DeckSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-dark-bg-secondary rounded-2xl p-4 border border-dark-border-glow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-5 bg-dark-bg-tertiary rounded w-32 mb-2"></div>
          <div className="h-3 bg-dark-bg-tertiary rounded w-20"></div>
        </div>
        <div className="h-8 w-8 bg-dark-bg-tertiary rounded-lg"></div>
      </div>
      <div className="h-3 bg-dark-bg-tertiary rounded w-24"></div>
    </div>
  </div>
)
