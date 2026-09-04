import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "@/lib/gsap";

type ImageType = {
  src: string;
  srcMobile: string;
  alt: string;
  caption?: string;
};

type CarouselProps = {
  images: ImageType[];
};

const AUTOPLAY_DELAY = 4000;

export default function Carousel({ images }: CarouselProps) {
  const autoplay = React.useRef(
    Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [autoplay.current]
  );

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const progressRef   = React.useRef<HTMLDivElement>(null);
  const progressTween = React.useRef<gsap.core.Tween | null>(null);

  const startProgress = React.useCallback(() => {
    if (!progressRef.current) return;
    progressTween.current?.kill();
    gsap.set(progressRef.current, { scaleX: 0, transformOrigin: 'left center' });
    progressTween.current = gsap.to(progressRef.current, {
      scaleX: 1,
      duration: AUTOPLAY_DELAY / 1000,
      ease: 'none',
    });
  }, []);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    startProgress();
  }, [emblaApi, startProgress]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo   = (i: number) => emblaApi?.scrollTo(i);

  const pauseAll  = () => { progressTween.current?.pause(); autoplay.current.stop(); };
  const resumeAll = () => { progressTween.current?.play();  autoplay.current.play(); };

  return (
    <div className="w-full max-w-3xl mx-auto select-none">
      {/* Gradient border frame */}
      <div className="p-[1.5px] rounded-2xl bg-linear-to-br from-semcompMidLightBlue/50 via-semcompLightBlue/15 to-transparent shadow-[0_0_48px_rgba(53,123,163,0.18)]">
        <div
          className="relative overflow-hidden rounded-2xl bg-semcompDarkBlue"
          style={{ height: 'clamp(220px, 38vw, 340px)' }}
          ref={emblaRef}
          onMouseEnter={pauseAll}
          onMouseLeave={resumeAll}
        >
          {/* Slides */}
          <div className="flex h-full">
            {images.map((img, i) => (
              <div key={i} className="flex-[0_0_100%] h-full relative">
                <picture className="block w-full h-full">
                  <source
                    media="(max-width: 768px)"
                    srcSet={img.srcMobile}
                  />

                  <img
                    src={img.src}
                    alt={img.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={"auto"}
                    className="w-full h-full object-cover"
                  />
                </picture>
                {/* Depth gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/45 to-transparent pointer-events-none" />

                {img.caption && (
                  <p className="absolute bottom-3 left-4 text-white text-xs font-poppins bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-md">
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Slide counter */}
          <div className="absolute top-3 right-3 bg-black/35 backdrop-blur-sm text-semcompOffWhite text-[11px] font-poppins font-semibold tabular-nums px-2.5 py-1 rounded-full pointer-events-none">
            {String(selectedIndex + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(images.length).padStart(2, '0')}
          </div>

          {/* GSAP progress bar */}
          <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/10 pointer-events-none">
            <div ref={progressRef} className="h-full bg-semcompMidLightBlue rounded-full" />
          </div>

          {/* Prev arrow */}
          <button
            onClick={scrollPrev}
            aria-label="Slide anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm border border-white/20 text-white p-2 rounded-full hover:bg-black/55 hover:scale-110 transition-all duration-200"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Next arrow */}
          <button
            onClick={scrollNext}
            aria-label="Próximo slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm border border-white/20 text-white p-2 rounded-full hover:bg-black/55 hover:scale-110 transition-all duration-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Story-style dot indicators */}
      <div className="flex gap-1.5 justify-center mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Ir para slide ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === selectedIndex
                ? 'w-6 bg-semcompMidLightBlue'
                : 'w-3 bg-semcompOffWhite/25 hover:bg-semcompOffWhite/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
