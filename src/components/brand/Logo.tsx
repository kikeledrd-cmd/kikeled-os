import { brand } from '../../lib/brand';

type LogoProps = {
  size?: 'nav' | 'hero' | 'footer';
};

export function Logo({ size = 'nav' }: LogoProps) {
  return (
    <div className={`k-logo k-logo-${size}`}>
      <img src="/brand/kikeled-logo.png" alt={`${brand.name} logo`} />
      <span className="k-logo-fallback">{brand.name}</span>
    </div>
  );
}
