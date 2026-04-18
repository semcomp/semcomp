export default function RouteLoading() {
  return (
    <div className="relative flex min-h-[55vh] w-full items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-semcompLightBlue/35 via-transparent to-semcompOffWhite/35" />

      <div className="relative w-full max-w-md rounded-3xl border border-semcompMidLightBlue/30 bg-white/75 p-6 shadow-xl backdrop-blur-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full border-2 border-semcompMidLightBlue/35" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-semcompMidDarkBlue" />
          </div>
          <div>
            <p className="font-poppins text-sm font-semibold tracking-wide text-semcompMidDarkBlue">Carregando página</p>
            <p className="font-poppins text-xs text-semcompMidDarkBlue/75">Preparando conteúdo para você...</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-semcompMidLightBlue/30" />
          <div className="h-3 w-3/4 animate-pulse rounded-full bg-semcompMidLightBlue/25" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-semcompMidLightBlue/20" />
        </div>
      </div>
    </div>
  );
}
