import LogoSVG from '../../assets/logo_default_preto.svg';

export default function Logo({ className = '', width = "1vw", height = "1vh", fillColor = '#000' }) {
  return (
    <LogoSVG
      className={className}
      width={width}
      height={height}
      fill={fillColor}
    />
  );
}
