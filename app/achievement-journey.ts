export type JourneyRoad = 'level' | 'referral' | 'deposit' | 'withdraw' | 'casino' | 'sports' | 'slots' | 'mini';
export type JourneyPoint = [number, number];

/** Keep the approved level route; give every other route the same centered final goal. */
export function getJourneyLayout(road: JourneyRoad, count: number): { points: JourneyPoint[]; height?: number } {
  if (road === 'level') {
    return { points: [
      [14, 26], [32, 26], [50, 26], [68, 26], [86, 26],
      [86, 54], [68, 54], [50, 54], [32, 54], [18, 76], [50, 84],
    ] };
  }

  const intermediateCount = count - 1;
  const columns = intermediateCount <= 4 ? 2 : intermediateCount <= 6 ? 3 : 4;
  const rows = Math.ceil(intermediateCount / columns);
  // More milestones add vertical space, never horizontal scrolling or smaller rewards.
  const finalY = 96 + (rows - 1) * 96 + 110;
  const height = Math.max(375, finalY + 65);
  const points: JourneyPoint[] = Array.from({ length: intermediateCount }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const x = 14 + (column * 72) / (columns - 1);
    return [row % 2 === 0 ? x : 100 - x, ((96 + row * 96) / height) * 100];
  });
  points.push([50, (finalY / height) * 100]);
  return { points, height };
}

/** Clamp endpoints so a completed journey's arrow stays on its final badge. */
export function getJourneyMarker(values: readonly number[], points: readonly JourneyPoint[], current: number): JourneyPoint {
  if (current <= values[0]) return points[0];
  if (current >= values[values.length - 1]) return points[points.length - 1];
  const next = values.findIndex(target => target > current);
  const previous = next - 1;
  const progress = (current - values[previous]) / (values[next] - values[previous]);
  return [
    points[previous][0] + (points[next][0] - points[previous][0]) * progress,
    points[previous][1] + (points[next][1] - points[previous][1]) * progress,
  ];
}
