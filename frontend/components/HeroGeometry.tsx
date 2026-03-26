"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

type MouseState = { x: number; y: number };

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ── 이십면체 메시 ────────────────────────────────────────────────────────── */
function Icosahedron({
  mouse,
  lastMoveAtMs,
  isFocused,
}: {
  mouse: React.MutableRefObject<MouseState>;
  lastMoveAtMs: React.MutableRefObject<number>;
  isFocused: React.MutableRefObject<boolean>;
}) {
  const meshRef   = useRef<THREE.Mesh>(null);
  const edgesRef  = useRef<THREE.LineSegments>(null);
  const glowRef   = useRef<THREE.Mesh>(null);
  const hazeRef   = useRef<THREE.Mesh>(null);

  const lookRef = useRef<MouseState>({ x: 0, y: 0 });

  const rimMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color("#ffffff") },
        uIntensity: { value: 0.55 },
        uPower: { value: 2.2 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uPower;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float ndv = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
          float fresnel = pow(1.0 - ndv, uPower);
          float a = fresnel * uIntensity;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  const hazeGeo = useMemo(() => new THREE.SphereGeometry(0.86, 32, 32), []);

  // 20개 면 각각의 페이드 위상
  const FACE_COUNT = 20;
  const facePhases = useMemo(
    () => Array.from({ length: FACE_COUNT }, (_, i) => ({
      speed:  0.0005 + (i % 5) * 0.00015,
      offset: (i / FACE_COUNT) * Math.PI * 2,
    })),
    []
  );

  // 면별 MaterialArray 대신 vertex color로 페이드 처리
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);

  // 각 면의 버텍스 인덱스 (flat shading → 면당 3 버텍스)
  const faceOpacities = useRef<Float32Array>(
    new Float32Array(FACE_COUNT).fill(1)
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 마우스 기반 시점 변화 (부드럽게 보간)
    const idleMs = performance.now() - lastMoveAtMs.current;
    const shouldFreeze = idleMs >= 3000 || !isFocused.current;

    // 마우스가 멈추거나 포커스 밖이면 "원위치 복귀" 대신
    // 현재 기울기를 유지한 채 계속 회전하도록 타겟을 고정
    const targetX = shouldFreeze ? lookRef.current.x : clamp(mouse.current.x, -1, 1);
    const targetY = shouldFreeze ? lookRef.current.y : clamp(mouse.current.y, -1, 1);

    lookRef.current.x = lerp(lookRef.current.x, targetX, 0.11);
    lookRef.current.y = lerp(lookRef.current.y, targetY, 0.11);

    const parallaxX = -lookRef.current.y * 0.32; // 위/아래 → x축 기울기
    const parallaxY =  lookRef.current.x * 0.36; // 좌/우 → y축 기울기

    // 회전: 기존 일정 속도로 복귀 (네온판 효과는 유지)
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.12 + parallaxY;
      meshRef.current.rotation.x = 0.30 + Math.sin(t * 0.05) * 0.12 + parallaxX;
    }
    if (edgesRef.current) {
      edgesRef.current.rotation.y = t * 0.12 + parallaxY;
      edgesRef.current.rotation.x = 0.30 + Math.sin(t * 0.05) * 0.12 + parallaxX;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = t * 0.12 + parallaxY;
      glowRef.current.rotation.x = 0.30 + Math.sin(t * 0.05) * 0.12 + parallaxX;
    }
    if (hazeRef.current) {
      hazeRef.current.rotation.y = t * 0.12 + parallaxY * 0.7;
      hazeRef.current.rotation.x = 0.30 + Math.sin(t * 0.05) * 0.12 + parallaxX * 0.7;
    }

    // 면별 페이드 — vertex color alpha로 처리
    const colors = geo.attributes.color;
    if (colors) {
      for (let fi = 0; fi < FACE_COUNT; fi++) {
        const fp   = facePhases[fi];
        const sinV = Math.sin(t * fp.speed * 60 + fp.offset);
        const fade = sinV * sinV; // 0→1→0
        const alpha = 0.15 + fade * 0.85;
        // 면당 3 버텍스
        for (let vi = 0; vi < 3; vi++) {
          colors.setW(fi * 3 + vi, alpha);
        }
      }
      colors.needsUpdate = true;
    }
  });

  // vertex color (RGBA) 초기화
  const colorArray = useMemo(() => {
    const arr = new Float32Array(FACE_COUNT * 3 * 4);
    for (let i = 0; i < FACE_COUNT * 3; i++) {
      arr[i * 4 + 0] = 1;   // R
      arr[i * 4 + 1] = 1;   // G
      arr[i * 4 + 2] = 1;   // B
      arr[i * 4 + 3] = 0.5; // A (초기값)
    }
    return arr;
  }, []);

  useMemo(() => {
    geo.setAttribute(
      "color",
      new THREE.BufferAttribute(colorArray, 4, true)
    );
  }, [geo, colorArray]);

  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  return (
    <group>
      {/* 내부 헤이즈: 중앙 광점 대신 아주 약한 안개 */}
      <mesh ref={hazeRef} geometry={hazeGeo}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.035}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 면 (반투명 흰색, 앞면만, 페이드인아웃) */}
      <mesh ref={meshRef} geometry={geo}>
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.09}
          side={THREE.FrontSide}
          depthWrite={false}
          wireframe={false}
        />
      </mesh>

      {/* 엣지 라인 */}
      <lineSegments ref={edgesRef} geometry={edgesGeo}>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.52}
          depthWrite={false}
        />
      </lineSegments>

      {/* 프레넬 림 라이트: 외곽 하이라이트 강화 */}
      <mesh ref={glowRef} geometry={geo} scale={1.02} material={rimMaterial} />
    </group>
  );
}

/* ── 페이드인아웃 면 오버레이 (개별 Mesh) ──────────────────────────────────── */
function FadingFaces() {
  const groupRef = useRef<THREE.Group>(null);
  const FACE_COUNT = 20;

  // IcosahedronGeometry flat → 20개 삼각형 face position 추출
  const faceMeshes = useMemo(() => {
    const baseGeo = new THREE.IcosahedronGeometry(1.002, 0);
    const pos = baseGeo.attributes.position;
    const meshes: { geo: THREE.BufferGeometry; phase: { speed: number; offset: number } }[] = [];

    for (let fi = 0; fi < FACE_COUNT; fi++) {
      const faceGeo = new THREE.BufferGeometry();
      const verts = new Float32Array(9);
      for (let vi = 0; vi < 3; vi++) {
        verts[vi * 3 + 0] = pos.getX(fi * 3 + vi);
        verts[vi * 3 + 1] = pos.getY(fi * 3 + vi);
        verts[vi * 3 + 2] = pos.getZ(fi * 3 + vi);
      }
      faceGeo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
      faceGeo.computeVertexNormals();
      meshes.push({
        geo: faceGeo,
        phase: {
          speed:  0.4 + (fi % 5) * 0.1,
          offset: (fi / FACE_COUNT) * Math.PI * 2,
        },
      });
    }
    return meshes;
  }, []);

  const materialsRef = useRef<THREE.MeshBasicMaterial[]>(
    faceMeshes.map(
      () =>
        new THREE.MeshBasicMaterial({
          color: "#ffffff",
          transparent: true,
          opacity: 0,
          side: THREE.FrontSide,   // 뒷면 컬링 — 앞면만 표시
          depthWrite: false,
        })
    )
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.07 + Math.sin(t * 0.11) * 0.02;
      groupRef.current.rotation.x = 0.30 + Math.sin(t * 0.04) * 0.10;
      groupRef.current.rotation.z = Math.sin(t * 0.06) * 0.03;
    }
    faceMeshes.forEach(({ phase }, fi) => {
      const sinV = Math.sin(t * phase.speed + phase.offset);
      const fade = sinV * sinV;
      // 여러 주기로 숨 쉬듯 움직이게 (강도는 낮게 유지)
      const breath = 0.65 + Math.sin(t * 0.22 + phase.offset) * 0.35;
      materialsRef.current[fi].opacity = fade * 0.07 * breath;
    });
  });

  return (
    <group ref={groupRef}>
      {faceMeshes.map(({ geo }, fi) => (
        <mesh key={fi} geometry={geo} material={materialsRef.current[fi]} />
      ))}
    </group>
  );
}

/* ── 궤도 파티클 (링 위 공전) ─────────────────────────────────────────────── */
function OrbitParticles() {
  const innerRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Group>(null);

  const innerPositions = useMemo(() => {
    const count = 8;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      arr[i * 3 + 0] = Math.cos(a) * 1.55;
      arr[i * 3 + 1] = Math.sin(a) * 1.55;
      arr[i * 3 + 2] = 0;
    }
    return arr;
  }, []);

  const outerPositions = useMemo(() => {
    const count = 6;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.PI / 6;
      arr[i * 3 + 0] = Math.cos(a) * 1.78;
      arr[i * 3 + 1] = Math.sin(a) * 1.78;
      arr[i * 3 + 2] = 0;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // 서로 다른 축/속도로 공전 + 저주파 변조
    if (innerRef.current) {
      innerRef.current.rotation.z =  t * 0.18 + Math.sin(t * 0.30) * 0.08;
      innerRef.current.rotation.x =  Math.sin(t * 0.17) * 0.12;
    }
    if (outerRef.current) {
      outerRef.current.rotation.z = -t * 0.11 + Math.sin(t * 0.23 + 1.4) * 0.10;
      outerRef.current.rotation.y =  Math.sin(t * 0.13 + 0.6) * 0.10;
    }
  });

  return (
    <>
      <group ref={innerRef}>
        <Points positions={innerPositions}>
          <PointMaterial
            color="#ffffff"
            size={0.045}
            transparent
            opacity={0.75}
            sizeAttenuation
            depthWrite={false}
          />
        </Points>
      </group>
      <group ref={outerRef}>
        <Points positions={outerPositions}>
          <PointMaterial
            color="#a78bfa"
            size={0.038}
            transparent
            opacity={0.8}
            sizeAttenuation
            depthWrite={false}
          />
        </Points>
      </group>
    </>
  );
}

/* ── 부유 파티클 (랜덤 별 반짝임) ────────────────────────────────────────── */
function FloatParticles() {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors, phases } = useMemo(() => {
    const count = 80;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const ph  = Array.from({ length: count }, () => ({
      floatAmp:   0.04 + Math.random() * 0.12,
      floatSpeed: 0.3  + Math.random() * 0.5,
      floatOff:   Math.random() * Math.PI * 2,
      twinkle:    0.4  + Math.random() * 0.8,
      twinkleOff: Math.random() * Math.PI * 2,
    }));

    const palette = [
      [0.96, 0.97, 1],    // soft white
      [0.66, 0.55, 0.98], // purple
      [0, 1, 0.53],       // green
    ];

    for (let i = 0; i < count; i++) {
      // 구형 분포 안에 랜덤 배치
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 1.3 + Math.random() * 1.4;
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[i % 3];
      col[i * 3 + 0] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { positions: pos, colors: col, phases: ph };
  }, []);

  const baseY = useMemo(() => Float32Array.from(positions).filter((_, i) => i % 3 === 1), [positions]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < phases.length; i++) {
      const ph = phases[i];
      pos.setY(i, baseY[i] + Math.sin(t * ph.floatSpeed + ph.floatOff) * ph.floatAmp);
    }
    pos.needsUpdate = true;
    // 다축으로 천천히 드리프트
    ref.current.rotation.y = t * 0.022 + Math.sin(t * 0.07) * 0.05;
    ref.current.rotation.x = Math.sin(t * 0.05 + 0.6) * 0.06;
    ref.current.rotation.z = Math.sin(t * 0.06 + 1.1) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors,    3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.022}
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ── 방사형 스트릭 (페이드인아웃) ────────────────────────────────────────── */
function Streaks() {
  const groupRef = useRef<THREE.Group>(null);
  const STREAK_COUNT = 12;

  const lineObjects = useMemo(() => {
    const arr: THREE.Line[] = [];
    for (let i = 0; i < STREAK_COUNT; i++) {
      const angle = (i / STREAK_COUNT) * Math.PI * 2;
      const r0 = 1.08, r1 = 1.48;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array([
            Math.cos(angle) * r0, Math.sin(angle) * r0, 0,
            Math.cos(angle) * r1, Math.sin(angle) * r1, 0,
          ]),
          3
        )
      );
      const mat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? "#ffffff" : "#a78bfa",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      arr.push(new THREE.Line(geo, mat));
    }
    return arr;
  }, []);

  const phases = useMemo(
    () =>
      Array.from({ length: STREAK_COUNT }, (_, i) => ({
        speed:      0.36 + (i % 2) * 0.12,
        offset:     (i / STREAK_COUNT) * Math.PI * 2,
        rotSpeed:   0.018 + (i % 3) * 0.006,
      })),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) groupRef.current.rotation.z = t * 0.05;
    phases.forEach((ph, i) => {
      const sinV = Math.sin(t * ph.speed + ph.offset);
      (lineObjects[i].material as THREE.LineBasicMaterial).opacity = sinV * sinV * 0.35;
    });
  });

  return (
    <group ref={groupRef}>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}

/* ── 다이나믹 링 ──────────────────────────────────────────────────────────── */
function Rings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z =  t * 0.09 + Math.sin(t * 0.18) * 0.05;
      ring1Ref.current.rotation.x =  Math.sin(t * 0.09) * 0.08;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.06 + Math.sin(t * 0.16 + 2.0) * 0.06;
      ring2Ref.current.rotation.y =  Math.sin(t * 0.08 + 0.4) * 0.08;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref}>
        <ringGeometry args={[1.52, 1.54, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.09} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={ring2Ref}>
        <ringGeometry args={[1.74, 1.76, 128]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.10} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </>
  );
}

/* ── 조명 ─────────────────────────────────────────────────────────────────── */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-2, -2, 2]} intensity={0.42} color="#ffffff" />
      <pointLight position={[2, 2, -2]} intensity={0.3} color="#7c3aed" />
    </>
  );
}

/* ── 최상위 컴포넌트 ──────────────────────────────────────────────────────── */
interface Props { size?: number }

export default function HeroGeometry({ size = 520 }: Props) {
  const mouse = useRef<MouseState>({ x: 0, y: 0 });
  const lastMoveAtMs = useRef<number>(performance.now());
  const isFocused = useRef<boolean>(true);

  useEffect(() => {
    const updateFromEvent = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = (e.clientX / w) * 2 - 1;
      const ny = (e.clientY / h) * 2 - 1;
      mouse.current.x = nx;
      mouse.current.y = ny;
      lastMoveAtMs.current = performance.now();
      isFocused.current = true;
    };

    const handleBlur = () => {
      isFocused.current = false;
    };
    const handleFocus = () => {
      isFocused.current = true;
      lastMoveAtMs.current = performance.now();
    };
    const handleVisibility = () => {
      isFocused.current = document.visibilityState === "visible";
      lastMoveAtMs.current = performance.now();
    };
    const handleDocLeave = () => {
      isFocused.current = false;
      lastMoveAtMs.current = performance.now();
    };

    window.addEventListener("mousemove", updateFromEvent, { passive: true });
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("mouseleave", handleDocLeave);

    return () => {
      window.removeEventListener("mousemove", updateFromEvent);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("mouseleave", handleDocLeave);
    };
  }, []);

  return (
    <div
      style={{ width: size, height: size, pointerEvents: "none" }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <Lights />
        <FadingFaces />
        <Rings />
        <OrbitParticles />
        <Icosahedron mouse={mouse} lastMoveAtMs={lastMoveAtMs} isFocused={isFocused} />
        <FloatParticles />
      </Canvas>
    </div>
  );
}
