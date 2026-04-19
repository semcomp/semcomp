import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight } from "lucide-react";

type ImageType = {
  src: string;
  alt: string;
  caption?: string;
};

type CarouselProps = {
  images: ImageType[];
};

export default function Carousel({ images }: CarouselProps) {
  const autoplay = React.useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [autoplay.current]
  );

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full max-w-3xl mx-auto">

      <div
        className="overflow-hidden rounded-xl h-75"
        ref={emblaRef}
        onMouseEnter={() => autoplay.current.stop()}
        onMouseLeave={() => autoplay.current.play()}
      >
        <div className="flex h-full">
          {images.map((img, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] h-full relative"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
                sizes="(max-width: 768px) 100vw, 896px"
                className="w-full h-full object-cover"
              />

              {img.caption && (
                <div className="absolute bottom-4 left-4 text-white bg-black/40 px-3 py-1 rounded-md text-sm">
                  {img.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-2 text-semcompOffBlack top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
      >
        <ArrowLeft size={20} />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-2 text-semcompOffBlack top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
      >
        <ArrowRight size={20} />
      </button>

      <div className="flex justify-center gap-2 mt-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-2 w-2 rounded-full transition-all ${
              i === selectedIndex
                ? "bg-blue-600 w-4"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}