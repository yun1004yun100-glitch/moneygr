// Required wagering within each level, in KRW (not cumulative lifetime totals).
export const memberLevelTargets = [
  100, 120, 130, 150, 170, 190, 210, 240, 270, 300,
  340, 380, 430, 480, 550, 620, 700, 780, 880, 1000,
].map(amount => amount * 10_000);

export function memberLevelTarget(level: number): number {
  const safeLevel = Number.isSafeInteger(level) && level > 0 ? level : 1;
  return memberLevelTargets[Math.min(safeLevel, memberLevelTargets.length) - 1];
}

export function advanceMemberLevel<T extends { level: number; levelBetting: number; pendingRewards: number }>(player: T, amount: number) {
  let level = Number.isSafeInteger(player.level) && player.level > 0 ? player.level : 1;
  let levelBetting = (Number.isSafeInteger(player.levelBetting) && player.levelBetting >= 0 ? player.levelBetting : 0) + amount;
  let pendingRewards = player.pendingRewards;
  while (levelBetting >= memberLevelTarget(level)) {
    levelBetting -= memberLevelTarget(level);
    level++;
    pendingRewards++;
  }
  return { ...player, level, levelBetting, pendingRewards, requiredBetting: memberLevelTarget(level) };
}
