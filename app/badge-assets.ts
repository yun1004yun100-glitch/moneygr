import { ACHIEVEMENT_BADGES } from './achievement-badges';

const currentBadges = new Set(Object.values(ACHIEVEMENT_BADGES));

// Old wardrobe selections may still contain paths from before transparent badges.
export function resolveBadgeAsset(asset: string): string {
  if (!/^\/badges\/achievement-[a-z0-9-]+-v2\.png$/.test(asset)) return asset;
  const current = asset.replace(/-v2\.png$/, '-transparent-v3.png');
  return currentBadges.has(current) ? current : asset;
}
