/** Closed cross-section in millimetres, ready for outward-wound LatheGeometry.
 * Repeated shoulder vertices keep the bevel normal separate from the flat top.
 * The bevel reaches the bore, so there is no radial end-wall/ledge.
 */
export function bevelProfilePoints(innerRadius: number, width: number, thickness: number, t0: number, t1: number): [number, number][] {
  const shoulder = 0.78;
  const radiusAt = (t: number) => innerRadius + thickness * (Math.abs(t) <= shoulder ? 1 : (1 - Math.abs(t)) / (1 - shoulder));
  const points: [number, number][] = [[innerRadius, t0 * width / 2]];
  const top: [number, number][] = [[radiusAt(t1), t1 * width / 2]];
  for (const t of [shoulder, -shoulder]) {
    if (t > t0 && t < t1) {
      top.push([radiusAt(t), t * width / 2], [radiusAt(t), t * width / 2]);
    }
  }
  top.push([radiusAt(t0), t0 * width / 2]);
  points.push([innerRadius, t1 * width / 2], ...top, [innerRadius, t0 * width / 2]);
  return points.reverse();
}