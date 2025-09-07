import LogoSVG from '../../assets/logo_default_preto.svg';

export default function Logo({ className = '', width = 100, height = 100, fillColor = '#000' }) {
  return (
    <LogoSVG
      className={className}
      width={width}
      height={height}
      fill={fillColor}
    />
  );
}
