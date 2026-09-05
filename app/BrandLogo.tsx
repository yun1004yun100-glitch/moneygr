export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-logo ${compact ? 'compact' : ''}`} aria-label="머니그라운드">
      <img src="/moneyground-mg-emblem.png" alt="" />
      <b>머니그라운드</b>
    </span>
  );
}
