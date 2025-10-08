import Image, { StaticImageData } from "next/image";

type Logo = {
  src: any;
  isSvg: boolean;
  width: number;
  height: number;
  hasWhiteBg?: boolean;
};

interface PartnerGridProps {
  logos: Logo[];
}

export default function PartnerGrid({ logos }: PartnerGridProps) {
  return (
    <div className="text-base max-w-6xl">
      <div className="grid md:grid-cols-4 md:gap-10 phone:grid-cols-2 phone:gap-4 tablet:grid-cols-3 tablet:gap-8">
        {logos.map((logo, index) => {
          const content = logo.isSvg ? (
            <logo.src
              className="w-full h-full object-contain"
              width={logo.width || 150}
              height={logo.height || 50}
            />
          ) : (
            <Image
              src={logo.src as StaticImageData}
              alt={`Logo ${index}`}
              width={logo.width || 150}
              height={logo.height || 50}
              className="w-full h-full object-contain"
            />
          );

          return (
            <div
              key={index}
              className="relative md:h-44 md:w-44 tablet:h-32 tablet:w-32 phone:h-28 phone:w-28 lg:w-60 flex items-center justify-center"
            >
              {logo?.hasWhiteBg ? (
                <div
                  className="bg-white p-2 rounded-md flex items-center justify-center"
                  style={{ width: 150, height: 100 }}
                >
                  {content}
                </div>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}
