import Image, { StaticImageData } from 'next/image';
import defaultLogo from '../../assets/28-imgs/logo.png';

type LogoProps = {
  className?: string;
  width?: string;
  height?: string;
  src?: string | StaticImageData;
  alt?: string;
};

export default function Logo({
  className = '',
  width = "1vm",
  height = "1vm",
  src,
  alt = 'Semcomp Logo',
}: LogoProps) {
  return (
    <Image
      src={src ?? defaultLogo}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
