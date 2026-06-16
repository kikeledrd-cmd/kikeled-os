import { brand } from '../../lib/brand';

export function Logo({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const isLarge = size === 'lg';

  return (
    <div className={`k-logo-lockup ${isLarge ? 'k-logo-lockup-lg' : ''}`}>
      <img className="k-logo-mark" src="/kikeled-rgb-logo.jpg" alt={`${brand.name} logo`} />
      <div>
        <p className="k-logo-title">KIKELED</p>
        <p className="k-logo-subtitle">STUDIO SRL</p>
      </div>
    </div>
  );
}
