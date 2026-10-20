import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { Box3, Mesh, Vector3, type Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RING_MODELS } from "../data/ring-models";
import { cloneRingModel } from "../lib/ring-model-scene";

async function loadModel(id: string) {
  const model = RING_MODELS[id]!;
  const bytes = readFileSync(path.join(process.cwd(), "public", model.url));
  const data = Uint8Array.from(bytes).buffer;
  const { scene } = await new GLTFLoader().parseAsync(data, "");
  return { model, scene };
}

function displayScale(root: Object3D, radial = 1) {
  root.children.forEach((child) => child.scale.set(0.1, 0.1 * radial, 0.1 * radial));
  root.updateMatrixWorld(true);
}

describe("Infinity stone model units", () => {
  it.each(["in6004", "in6010", "in1915"])(
    "%s places its authored stones at the band surface and keeps the cached GLTF intact",
    async (id) => {
      const { model, scene } = await loadModel(id);
      const originalStone = scene.getObjectByName("Stone_01")!;
      const originalPosition = originalStone.position.clone();
      const originalScale = originalStone.scale.clone();
      const root = cloneRingModel(scene, model.stoneUnitsToMm);
      const stone = root.getObjectByName("Stone_01")!;
      displayScale(root);

      // The roughly 21 mm ring is displayed at 0.1 scene units/mm. Its stones
      // must sit about 1 unit from the centre, not disappear at 0.01 units.
      const centre = stone.getWorldPosition(new Vector3());
      expect(Math.hypot(centre.y, centre.z)).toBeGreaterThan(0.9);
      expect(Math.hypot(centre.y, centre.z)).toBeLessThan(1.2);
      const size = new Box3().setFromObject(stone).getSize(new Vector3());
      expect(size.x).toBeGreaterThan(0.1);
      expect(size.x).toBeLessThan(0.4);

      // Reapplying ring-size scaling must scale the stone placement too,
      // without compounding the conversion or changing the loaded source.
      displayScale(root, 1.1);
      expect(stone.getWorldPosition(new Vector3()).y).toBeCloseTo(centre.y * 1.1);
      displayScale(root);
      expect(stone.getWorldPosition(new Vector3()).y).toBeCloseTo(centre.y);
      expect(originalStone.position.equals(originalPosition)).toBe(true);
      expect(originalStone.scale.equals(originalScale)).toBe(true);
      expect(originalStone.parent).toBe(scene);

      const originalMesh = originalStone.children[0] as Mesh;
      const stoneMesh = stone.children[0] as Mesh;
      expect(stoneMesh.geometry).toBe(originalMesh.geometry);
      expect(stoneMesh.material).toBe(originalMesh.material);
      expect(stoneMesh.morphTargetDictionary).toEqual(originalMesh.morphTargetDictionary);
      expect(stoneMesh.morphTargetInfluences).toEqual(originalMesh.morphTargetInfluences);
      expect(
        stone.children.map((child) => ((child as Mesh).material as { name: string }).name),
      ).toEqual(["Stone_01", "Stone_Top"]);

      const bandName = id.toUpperCase() + "D";
      const band = root.getObjectByName(bandName)!;
      const originalBand = scene.getObjectByName(bandName)!;
      expect(band.position.equals(originalBand.position)).toBe(true);
      expect(band.quaternion.equals(originalBand.quaternion)).toBe(true);
      const anotherClone = cloneRingModel(scene, model.stoneUnitsToMm);
      displayScale(anotherClone);
      expect(
        anotherClone.getObjectByName("Stone_01")!.getWorldPosition(new Vector3()).y,
      ).toBeCloseTo(centre.y);
    },
  );

  it("keeps classic model geometry and transforms unchanged", async () => {
    const { scene } = await loadModel("ac6");
    const expected = scene.clone(true);
    const actual = cloneRingModel(scene);
    displayScale(expected, 1.08);
    displayScale(actual, 1.08);
    expect(new Box3().setFromObject(actual)).toEqual(new Box3().setFromObject(expected));
    expect(actual.children.map((child) => child.name)).toEqual(
      expected.children.map((child) => child.name),
    );
  });
});
