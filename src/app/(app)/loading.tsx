/**
 * Shown the moment someone opens a signed-in page, while the server loads it.
 * Next.js also prefetches it with every visible link, so taps answer at once.
 * The shapes follow the real pages: a label, a title, a figure and ruled rows.
 */
function Block({ className }: { className: string }) {
  return <div className={`animate-pulse bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-12 md:gap-16">
      <span className="sr-only">Loading</span>
      <div className="flex flex-col gap-5">
        <Block className="h-4 w-28" />
        <Block className="h-11 w-64 max-w-full md:h-14 md:w-96" />
      </div>
      <div className="flex flex-col gap-4">
        <Block className="h-4 w-24" />
        <Block className="h-14 w-56 max-w-full md:h-20 md:w-80" />
      </div>
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-12">
        {[0, 1].map((column) => (
          <div key={column} className="flex flex-col">
            <Block className="mb-5 h-5 w-32" />
            <div className="border-t border-border">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex items-center gap-4 border-b border-border py-4">
                  <Block className="size-10 shrink-0" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Block className="h-4 w-2/5" />
                    <Block className="h-3 w-3/5" />
                  </div>
                  <Block className="h-5 w-16 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
