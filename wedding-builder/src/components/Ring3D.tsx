// The 3D ring on the stage. Infinity's own GLB models (width/thickness via morph targets, metal zones, stones) with a
// procedural band as the fallback, an engraving sleeve inside the band, and a soft studio light tent. Ported from
// Mark's ring-magic-studio Ring3D; the canvas is transparent so the section's navy stage shows through.
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { RING_MODELS, type RingModel } from "../data/ring-models";
import * as THREE from "three";
import { METALS_3D, FINISH_ROUGHNESS, type RingPattern } from "../lib/ring-3d-options";
import { bevelProfilePoints } from "../lib/ring-bevel-profile";
import { cloneRingModel } from "../lib/ring-model-scene";

export type Ring3DProps = {
  widthMm: number;
  innerDiameterMm: number;
  profile: string;
  finish: string;
  centreMetal: string;
  sideMetal: string;
  twoTone: boolean;
  pattern: RingPattern;
  ringId?: string;
  engravingText?: string;
  /** CSS font-family string */
  engravingFont?: string;
  /** Band thickness in mm (Infinity models only). */
  thicknessMm?: number | undefined;
  /** Stone colour for diamond-set models. */
  stoneColor?: string | undefined;
  /** Called once the WebGL canvas exists, so the order picture can be taken from it. */
  onCanvas?: (canvas: HTMLCanvasElement | null) => void;
  onLoaded?: () => void;
};

const THICKNESS = 1.6; // mm

/** Outer surface offset above the inner radius, for t in [-1, 1] across the width. */
function outerOffset(profile: string, t: number): number {
  const a = Math.abs(t);
  const dome = Math.sqrt(Math.max(0, 1 - t * t));
  switch (profile) {
    case "Flat":
      // flat top with softly rounded edges
      return THICKNESS * (a > 0.86 ? Math.sqrt(Math.max(0, 1 - ((a - 0.86) / 0.14) ** 2)) * 0.25 + 0.75 : 1);
    case "D-Shape":
      return THICKNESS * (0.3 + 0.7 * dome);
    case "Bevelled":
      // The bevel tapers all the way to the bore, without a radial end wall.
      return THICKNESS * (a < 0.78 ? 1 : (1 - a) / 0.22);
    case "Concave":
      return THICKNESS * (0.68 + 0.32 * t * t);
    default: // Court: gentle traditional dome
      return THICKNESS * (0.45 + 0.55 * dome);
  }
}

/** Inner surface bulge (comfort fit) for court & D-shape. */
function innerBulge(profile: string, t: number): number {
  if (profile === "Court" || profile === "D-Shape") return 0.3 * (1 - t * t);
  return 0;
}

const MEANDER = [[0, 0.19], [0.86, 0.19], [0.86, 0.81], [0.25, 0.81], [0.25, 0.39], [0.63, 0.39], [0.63, 0.61], [0.46, 0.61]];

function grooveDepth(u: number, v: number) {
  const x = (u * 12) % 1;
  let distance = 1;
  for (let i = 1; i < MEANDER.length; i++) {
    const a = MEANDER[i - 1];
    const b = MEANDER[i];
    if (!a || !b) continue;
    const ax = a[0] ?? 0, ay = a[1] ?? 0;
    const bx = b[0] ?? 0, by = b[1] ?? 0;
    const dx = bx - ax, dy = by - ay;
    const t = THREE.MathUtils.clamp(((x - ax) * dx + (v - ay) * dy) / (dx * dx + dy * dy), 0, 1);
    distance = Math.min(distance, Math.hypot(x - ax - t * dx, v - ay - t * dy));
  }
  return 0.018 * (1 - THREE.MathUtils.smoothstep(distance, 0.012, 0.045));
}

function bandSegment(profile: string, rIn: number, width: number, t0: number, t1: number, engraved = false) {
  const N = 64;
  const pts: THREE.Vector2[] = [];
  const half = width / 2;
  // inner face, t0 -> t1
  for (let i = 0; i <= N; i++) {
    const t = t0 + ((t1 - t0) * i) / N;
    pts.push(new THREE.Vector2((rIn - innerBulge(profile, t)) / 10, (t * half) / 10));
  }
  // outer face, t1 -> t0
  for (let i = 0; i <= N; i++) {
    const t = t1 - ((t1 - t0) * i) / N;
    pts.push(new THREE.Vector2((rIn + outerOffset(profile, t)) / 10, (t * half) / 10));
  }
  const first = pts[0];
  if (first) pts.push(first.clone());
  // LatheGeometry faces outward when the profile runs top -> bottom on the outer face; reverse to fix the winding.
  pts.reverse();
  // Explicit bevel shoulders prevent smoothed normals from rounding the transition.
  const crossSection = profile === "Bevelled"
    ? bevelProfilePoints(rIn, width, THICKNESS, t0, t1).map(([r, y]) => new THREE.Vector2(r / 10, y / 10))
    : pts;
  const g = new THREE.LatheGeometry(crossSection, engraved ? 1024 : 256);
  // Texture height follows the real band width, not the cross-section point index.
  const uv = g.getAttribute("uv");
  const position = g.getAttribute("position");
  for (let i = 0; i < uv.count; i++) {
    const v = (position.getY(i) * 10 / half - t0) / (t1 - t0);
    uv.setY(i, v);
    const x = position.getX(i), z = position.getZ(i);
    const radius = Math.hypot(x, z);
    // Carve only the outer surface; the interior remains polished and unpatterned.
    if (engraved && radius > (rIn + 0.4) / 10) {
      const depth = grooveDepth(uv.getX(i), v);
      position.setXYZ(i, x * (radius - depth) / radius, position.getY(i), z * (radius - depth) / radius);
    }
  }
  g.computeVertexNormals();
  return g;
}

function Band(props: Ring3DProps) {
  const { widthMm, innerDiameterMm, profile, finish, centreMetal, sideMetal, twoTone, pattern } = props;
  const rIn = innerDiameterMm / 2;

  const segments = useMemo(() => {
    if (!twoTone) return [{ g: bandSegment(profile, rIn, widthMm, -1, 1, pattern === "greek-key"), metal: centreMetal, patterned: true }];
    const rail = Math.min(0.32, (pattern === "greek-key" ? 0.65 : 1.1) / (widthMm / 2));
    const s = 1 - rail;
    return [
      { g: bandSegment(profile, rIn, widthMm, -1, -s), metal: sideMetal, patterned: false },
      { g: bandSegment(profile, rIn, widthMm, -s, s, pattern === "greek-key"), metal: centreMetal, patterned: true },
      { g: bandSegment(profile, rIn, widthMm, s, 1), metal: sideMetal, patterned: false },
    ];
  }, [profile, rIn, widthMm, twoTone, centreMetal, sideMetal, pattern]);
  useEffect(() => () => segments.forEach(({ g }) => g.dispose()), [segments]);

  const extraRough = FINISH_ROUGHNESS[finish] ?? 0;

  return (
    // Stand the band upright on its edge, turned three-quarters to camera, the pose Infinity uses in their photography.
    <group rotation={[0, 0.95, 0]}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        {segments.map((s, i) => {
          const m = METALS_3D[s.metal] ?? METALS_3D["platinum"];
          if (!m) return null;
          return (
            <mesh key={i} geometry={s.g} castShadow receiveShadow>
              <meshPhysicalMaterial
                color={m.color}
                metalness={m.metalness}
                roughness={Math.min(0.6, m.roughness + 0.07 + extraRough)}
                envMapIntensity={1.15}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** Infinity's own model for this style: morph targets drive width/thickness, metal zones get metals. */
function ModelBand({ model, ...props }: Ring3DProps & { model: RingModel }) {
  const { scene } = useGLTF(model.url);
  const root = useMemo(
    () => cloneRingModel(scene, model.stoneUnitsToMm),
    [scene, model.stoneUnitsToMm],
  );
  const { widthMm, innerDiameterMm, finish, centreMetal, sideMetal, twoTone, onLoaded } = props;
  const thicknessMm = props.thicknessMm ?? THICKNESS;
  const stoneColor = props.stoneColor ?? "#f4f8ff";
  const extraRough = FINISH_ROUGHNESS[finish] ?? 0;
  const materials = useMemo(() => {
    const make = (key: string) => {
      const m = METALS_3D[key] ?? METALS_3D["platinum"]!;
      return new THREE.MeshPhysicalMaterial({ color: m.color, metalness: m.metalness, roughness: Math.min(0.6, m.roughness + 0.07 + extraRough), envMapIntensity: 1.15 });
    };
    // Diamond-set models (IN6004/IN6010/IN1915) have separate stone meshes.
    const stone = new THREE.MeshPhysicalMaterial({ color: stoneColor, metalness: 0, roughness: 0.05, envMapIntensity: 2.5, clearcoat: 1, clearcoatRoughness: 0.05 });
    return { centre: make(centreMetal), side: make(twoTone ? sideMetal : centreMetal), stone };
  }, [centreMetal, sideMetal, twoTone, extraRough, stoneColor]);
  useEffect(() => () => { materials.centre.dispose(); materials.side.dispose(); materials.stone.dispose(); }, [materials]);
  useEffect(() => { onLoaded?.(); }, [root, onLoaded]);

  const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
  const ww = model.widthPerUnit > 0 ? clamp01((widthMm - model.baseWidth) / model.widthPerUnit) : 0;
  const tw = model.thicknessPerUnit > 0 ? clamp01((thicknessMm - model.baseThickness) / model.thicknessPerUnit) : 0;
  const radial = innerDiameterMm / 2 / model.innerRadius;

  // Flat profile: Infinity's real court geometry with the outer dome clamped to the band's peak height. Supplier Flat
  // models ship as profile sweeps we can't load directly, so this derives the Flat shape.
  const flat = props.profile === "Flat";
  const meshes = useMemo(() => {
    const list: { mesh: THREE.Mesh; base: Float32Array; w: Float32Array | null; t: Float32Array | null }[] = [];
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const g = m.geometry as THREE.BufferGeometry;
      const pos = g.getAttribute("position");
      if (!(pos instanceof THREE.BufferAttribute)) return;
      const idx = m.morphTargetDictionary ?? {};
      const grab = (name: string): Float32Array | null => {
        const i = idx[name];
        if (i === undefined) return null;
        const attr = g.morphAttributes.position?.[i];
        return attr ? (attr.array as Float32Array) : null;
      };
      list.push({ mesh: m, base: Float32Array.from(pos.array as ArrayLike<number>), w: grab("width"), t: grab("thickness") });
    });
    return list;
  }, [root]);
  const didFlat = useRef(false);

  useEffect(() => {
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const name = (Array.isArray(mesh.material) ? mesh.material[0]?.name : mesh.material?.name) ?? "";
      mesh.userData["zone"] ??= name;
      const zone = String(mesh.userData["zone"]);
      mesh.material = zone.includes("Stone") ? materials.stone : zone.includes("Zone_01") ? materials.centre : materials.side;
      mesh.castShadow = true;
    });
    for (const { mesh, base, w, t } of meshes) {
      const g = mesh.geometry as THREE.BufferGeometry;
      const attr = g.getAttribute("position") as THREE.BufferAttribute;
      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      if (flat && w && t) {
        // CPU-morph (width axis is X on Infinity models), then clamp the outer dome flat.
        const arr = attr.array as Float32Array;
        for (let i = 0; i < arr.length; i += 3) {
          arr[i] = base[i]! + ww * w[i]! + tw * t[i]!;
          arr[i + 1] = base[i + 1]! + ww * w[i + 1]! + tw * t[i + 1]!;
          arr[i + 2] = base[i + 2]! + ww * w[i + 2]! + tw * t[i + 2]!;
        }
        let peak = 0;
        for (let i = 0; i < arr.length; i += 3) peak = Math.max(peak, Math.hypot(arr[i + 1]!, arr[i + 2]!));
        for (let i = 0; i < arr.length; i += 3) {
          const r = Math.hypot(arr[i + 1]!, arr[i + 2]!);
          if (r > peak) { const f = peak / r; arr[i + 1] = arr[i + 1]! * f; arr[i + 2] = arr[i + 2]! * f; }
        }
        if (influences) influences.fill(0);
        attr.needsUpdate = true;
        g.computeVertexNormals();
      } else {
        if (didFlat.current) {
          // restore the authored base so GPU morphing is exact again
          (attr.array as Float32Array).set(base);
          attr.needsUpdate = true;
        }
        if (dict && influences) {
          if (dict["width"] !== undefined) mesh.morphTargetInfluences![dict["width"]] = ww;
          if (dict["thickness"] !== undefined) mesh.morphTargetInfluences![dict["thickness"]] = tw;
        }
      }
    }
    didFlat.current = flat;
    root.traverse((o) => { if (o.parent === root || o === root) { if (o !== root) o.scale.set(0.1, 0.1 * radial, 0.1 * radial); } });
  }, [root, materials, ww, tw, radial, flat, meshes, didFlat]);

  return (
    <group rotation={[0, 0.95, 0]}>
      {/* model ring axis is X; turn it to match the procedural band's axis */}
      <group rotation={[0, Math.PI / 2, 0]}>
        <primitive object={root} />
      </group>
    </group>
  );
}

/** Engraved text on the inside of the band: a thin textured sleeve just inside the inner surface. */
function Engraving({ text, font, widthMm, innerDiameterMm }: { text: string; font: string; widthMm: number; innerDiameterMm: number }) {
  const [fontReady, setFontReady] = useState(0);
  useEffect(() => {
    let live = true;
    document.fonts?.load(`96px ${font}`, text).then(() => live && setFontReady((n) => n + 1)).catch(() => {});
    return () => { live = false; };
  }, [font, text]);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 4096;
    canvas.height = 160;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let px = 110;
    ctx.font = `${px}px ${font}`;
    const maxW = canvas.width * 0.45;
    const w = ctx.measureText(text).width;
    if (w > maxW) { px = Math.floor((px * maxW) / w); ctx.font = `${px}px ${font}`; }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4);
    const t = new THREE.CanvasTexture(canvas);
    t.anisotropy = 8;
    // inner surface is viewed from inside: mirror so the text reads correctly
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.x = -1;
    t.offset.x = 0.75; // centre the text on the inner wall visible through the opening
    t.needsUpdate = true;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, font, fontReady]);
  useEffect(() => () => texture.dispose(), [texture]);

  const r = (innerDiameterMm / 2) * 0.1 * 0.965;
  const h = Math.max(0.12, widthMm * 0.1 * 0.6);
  return (
    <group rotation={[0, 0.95, 0]}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh renderOrder={2}>
          <cylinderGeometry args={[r, r, h, 160, 1, true]} />
          <meshStandardMaterial color="#2b2b2b" metalness={0.7} roughness={0.45} alphaMap={texture} transparent depthWrite={false} side={THREE.BackSide} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      </group>
    </group>
  );
}

/** Hands the renderer's canvas to the designer (for the order picture). */
function CanvasHandle({ onCanvas }: { onCanvas?: (c: HTMLCanvasElement | null) => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    onCanvas?.(gl.domElement);
    return () => onCanvas?.(null);
  }, [gl, onCanvas]);
  return null;
}

export default function Ring3D(props: Ring3DProps) {
  const model = props.ringId ? RING_MODELS[props.ringId] : undefined;
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 1.1, 7.4], fov: 30 }}
      gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        gl.setClearColor(0x000000, 0);
        camera.lookAt(0, -0.1, 0);
      }}
      shadows
    >
      <CanvasHandle onCanvas={props.onCanvas} />
      {model ? (
        <Suspense fallback={null}>
          <ModelBand {...props} model={model} />
        </Suspense>
      ) : (
        <Band {...props} />
      )}
      {props.engravingText && (
        <Engraving text={props.engravingText} font={props.engravingFont ?? "serif"} widthMm={props.widthMm} innerDiameterMm={props.innerDiameterMm} />
      )}
      <ContactShadows position={[0, -1.12, 0]} opacity={0.35} scale={5} blur={2.6} far={1.6} color="#05071a" />
      {/* Soft white jewellery light tent: broad bright panels and gentle mid-grey gradients so white metals read bright. */}
      <Environment resolution={512} background={false}>
        <color attach="background" args={["#b4b4b4"]} />
        <Lightformer form="circle" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[9, 9, 1]} />
        <Lightformer intensity={2.2} position={[-5, 1.5, 2]} rotation-y={Math.PI / 2.4} scale={[5, 6, 1]} />
        <Lightformer intensity={2} position={[5, 1, 2]} rotation-y={-Math.PI / 2.4} scale={[4, 6, 1]} />
        <Lightformer intensity={1.8} position={[0, 2, 6]} scale={[7, 3.5, 1]} />
        <Lightformer intensity={0.9} position={[0, 1, -6]} rotation-y={Math.PI} scale={[6, 2, 1]} />
        <Lightformer form="rect" color="#707070" intensity={1} position={[0, -3, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>
      <OrbitControls
        target={[0, -0.1, 0]}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
