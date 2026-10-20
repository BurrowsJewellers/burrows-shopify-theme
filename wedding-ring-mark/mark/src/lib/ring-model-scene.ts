import { Group, type Object3D } from "three";

/** Clone the cached GLTF without modifying its shared geometry or materials. */
export function cloneRingModel(scene: Object3D, stoneUnitsToMm = 1): Object3D {
  const root = scene.clone(true);
  if (stoneUnitsToMm === 1) return root;

  // IN6004/IN6010/IN1915 export stone nodes in metres and their bands in mm.
  // Convert both the gemstone geometry and its placement. A parent group lets
  // ModelBand's existing display/ring-size scale act on both together.
  for (const stone of [...root.children]) {
    if (!/^Stone_\d+$/.test(stone.name)) continue;
    const group = new Group();
    group.name = `${stone.name}_millimetres`;
    stone.position.multiplyScalar(stoneUnitsToMm);
    stone.scale.multiplyScalar(stoneUnitsToMm);
    group.add(stone);
    root.add(group);
  }
  return root;
}
