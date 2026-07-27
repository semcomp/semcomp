export default function RouteLoading() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-linear-to-br from-semcompLightBlue/20 via-semcompOffWhite to-semcompLightBlue/30 dark:from-semcompDarkBlue dark:via-semcompAlmostDarkBlue dark:to-semcompMidDarkBlue animate-pulse animation-duration-[5s]" />

      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-semcompLightBlue/20 dark:bg-semcompLightBlue/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-semcompMidLightBlue/15 dark:bg-semcompMidLightBlue/10 blur-3xl" />

      <div className="relative w-full max-w-md transform transition-all duration-500 hover:scale-[1.01]">
        <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/40 shadow-[0_8px_32px_0_rgba(15,103,177,0.1)] dark:border-semcompMidLightBlue/20 dark:bg-semcompDarkBlue/45 dark:shadow-[0_8px_32px_0_rgba(5,12,24,0.45)] p-8 backdrop-blur-md">

          <div className="mb-8 flex items-center gap-5">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className="absolute h-full w-full rounded-full border-4 border-semcompMidLightBlue/20" />
              <div className="absolute h-full w-full animate-spin rounded-full border-4 border-transparent border-t-semcompMidDarkBlue dark:border-t-semcompLightBlue shadow-inner" />
              <div className="h-2 w-2 animate-ping rounded-full bg-semcompMidDarkBlue dark:bg-semcompLightBlue" />
            </div>

            <div>
              <h3 className="font-poppins text-xl font-bold tracking-tight text-semcompMidDarkBlue dark:text-semcompOffWhite">
                Quase lá...
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative h-4 w-full overflow-hidden rounded-lg bg-semcompMidLightBlue/10 dark:bg-semcompMidLightBlue/15">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/50 dark:via-semcompLightBlue/30 to-transparent" />
            </div>
            <div className="relative h-4 w-5/6 overflow-hidden rounded-lg bg-semcompMidLightBlue/10 dark:bg-semcompMidLightBlue/15">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-linear-to-r from-transparent via-white/50 dark:via-semcompLightBlue/30 to-transparent" />
            </div>
            <div className="relative h-4 w-4/6 overflow-hidden rounded-lg bg-semcompMidLightBlue/10 dark:bg-semcompMidLightBlue/15">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-linear-to-r from-transparent via-white/50 dark:via-semcompLightBlue/30 to-transparent" />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-semcompMidLightBlue/10 text-semcompMidDarkBlue/50 dark:bg-semcompMidLightBlue/15 dark:text-semcompLightBlue/70">
              SEMCOMP 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
