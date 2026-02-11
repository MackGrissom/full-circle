"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ── Enso brush-stroke path ──────────────────────────────────────────

function generateEnsoPoints(segments = 256): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const arc = Math.PI * 1.83;
  const startAngle = Math.PI * 0.6;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = startAngle + t * arc;
    const wobbleR =
      Math.sin(t * Math.PI * 6) * 0.015 +
      Math.sin(t * Math.PI * 13) * 0.008;
    const wobbleY = Math.cos(t * Math.PI * 8) * 0.01;
    const radius = 2.2 + wobbleR;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius + wobbleY,
        0,
      ),
    );
  }
  return points;
}

function createEnsoGeometry(points: THREE.Vector3[]) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < points.length; i++) {
    const t = i / (points.length - 1);
    const taper = Math.sin(t * Math.PI);
    const width = 0.06 + taper * 0.07;

    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dir = new THREE.Vector3().subVectors(next, prev).normalize();
    const normal = new THREE.Vector3(-dir.y, dir.x, 0);
    const p = points[i];

    positions.push(
      p.x + normal.x * width, p.y + normal.y * width, p.z,
      p.x - normal.x * width, p.y - normal.y * width, p.z,
    );
    uvs.push(t, 0, t, 1);

    if (i < points.length - 1) {
      const vi = i * 2;
      indices.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ── Main brush stroke with traveling glow ───────────────────────────

function EnsoBrush({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [drawProgress, setDrawProgress] = useState(0);

  const geometry = useMemo(() => {
    const pts = generateEnsoPoints(200);
    return createEnsoGeometry(pts);
  }, []);

  // Draw-in animation
  useEffect(() => {
    let frame: number;
    let progress = 0;
    const draw = () => {
      progress += 0.005;
      if (progress > 1) progress = 1;
      setDrawProgress(progress);
      if (progress < 1) frame = requestAnimationFrame(draw);
    };
    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(draw);
    }, 600);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uDrawProgress.value = drawProgress;
    }
    if (meshRef.current) {
      meshRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.25) * 0.015 +
        scrollProgress * 0.5;
      meshRef.current.scale.setScalar(1 - scrollProgress * 0.15);
    }
  });

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uDrawProgress: { value: 0 },
          uColor: { value: new THREE.Color("#0099ff") },
          uGlowColor: { value: new THREE.Color("#66ccff") },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uDrawProgress;
          uniform vec3 uColor;
          uniform vec3 uGlowColor;
          varying vec2 vUv;

          void main() {
            if (vUv.x > uDrawProgress) discard;

            // Brush edge softness
            float edge = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.65, vUv.y);

            // ── Traveling light pulse ──
            // A bright spot that continuously orbits along the stroke
            float pulse1 = fract(uTime * 0.12);
            float pulse2 = fract(uTime * 0.12 + 0.5);
            float glow1 = exp(-pow((vUv.x - pulse1) * 8.0, 2.0));
            float glow2 = exp(-pow((vUv.x - pulse2) * 8.0, 2.0)) * 0.6;
            float travelGlow = glow1 + glow2;

            // ── Ambient breathing ──
            float breathe = 0.55 + 0.2 * sin(uTime * 1.2) + 0.1 * sin(uTime * 2.7 + 1.0);

            // ── Ink texture variation ──
            float inkVar = 0.8 + 0.2 * sin(vUv.x * 25.0 + uTime * 0.5);

            // ── Combine ──
            float baseAlpha = edge * inkVar * breathe;
            float glowAlpha = travelGlow * edge * 1.5;

            // Color: base ink is accent, traveling glow is brighter
            vec3 baseCol = mix(uColor, vec3(1.0), edge * 0.3);
            vec3 glowCol = mix(uGlowColor, vec3(1.0), 0.5);
            vec3 finalCol = mix(baseCol, glowCol, clamp(travelGlow, 0.0, 1.0));

            float alpha = clamp(baseAlpha + glowAlpha, 0.0, 1.0);

            // Fade at the drawing edge
            float drawFade = smoothstep(uDrawProgress, uDrawProgress - 0.08, vUv.x);
            alpha *= drawFade;

            gl_FragColor = vec4(finalCol, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  return (
    <mesh ref={meshRef} geometry={geometry} material={shaderMaterial}>
      <primitive object={shaderMaterial} ref={materialRef} />
    </mesh>
  );
}

// ── Outer glow layer (wider, softer) ────────────────────────────────

function EnsoGlow({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const pts = generateEnsoPoints(200);
    // Wider version for glow
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const t = i / (pts.length - 1);
      const taper = Math.sin(t * Math.PI);
      const width = 0.2 + taper * 0.2;
      const prev = pts[Math.max(0, i - 1)];
      const next = pts[Math.min(pts.length - 1, i + 1)];
      const dir = new THREE.Vector3().subVectors(next, prev).normalize();
      const normal = new THREE.Vector3(-dir.y, dir.x, 0);
      const p = pts[i];
      positions.push(
        p.x + normal.x * width, p.y + normal.y * width, p.z,
        p.x - normal.x * width, p.y - normal.y * width, p.z,
      );
      uvs.push(t, 0, t, 1);
      if (i < pts.length - 1) {
        const vi = i * 2;
        indices.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    return geo;
  }, []);

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#0099ff") },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;

          void main() {
            // Soft edge falloff
            float edge = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);

            // Pulsing
            float breathe = 0.3 + 0.15 * sin(uTime * 1.2) + 0.1 * sin(uTime * 0.7);

            // Traveling hotspot
            float pulse = fract(uTime * 0.12);
            float glow = exp(-pow((vUv.x - pulse) * 6.0, 2.0)) * 0.5;

            float alpha = edge * (breathe * 0.15 + glow);

            gl_FragColor = vec4(uColor, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.25) * 0.015 +
        scrollProgress * 0.5;
      meshRef.current.scale.setScalar(1 - scrollProgress * 0.15);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={shaderMaterial}>
      <primitive object={shaderMaterial} ref={materialRef} />
    </mesh>
  );
}

// ── Floating particles ──────────────────────────────────────────────

function EnsoParticles({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 160;

  const { positions, phases, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const sp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.6 + Math.random() * 1.4;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      ph[i] = Math.random() * Math.PI * 2;
      sp[i] = 0.1 + Math.random() * 0.2;
    }
    return { positions: pos, phases: ph, speeds: sp };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(positions[i * 3 + 1], positions[i * 3]);
      const radius = Math.sqrt(
        positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2,
      );
      const drift = t * speeds[i] + phases[i];
      arr[i * 3] =
        Math.cos(angle + drift * 0.4) *
        (radius + Math.sin(drift * 1.3) * 0.2);
      arr[i * 3 + 1] =
        Math.sin(angle + drift * 0.4) *
        (radius + Math.cos(drift * 1.1) * 0.2);
      arr[i * 3 + 2] = Math.sin(drift * 1.8) * 0.15;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    // Particle opacity pulses
    (ref.current.material as THREE.PointsMaterial).opacity =
      0.35 + Math.sin(t * 1.5) * 0.15;

    ref.current.rotation.z = scrollProgress * 0.3;
    ref.current.scale.setScalar(1 - scrollProgress * 0.1);
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        color="#0099ff"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ── Pulsing glow rings ──────────────────────────────────────────────

function GlowRings({ scrollProgress }: { scrollProgress: number }) {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = 1 - scrollProgress * 0.15;

    if (innerRef.current) {
      const p1 = 1 + Math.sin(t * 1.0) * 0.04;
      innerRef.current.scale.setScalar(p1 * s);
      innerRef.current.rotation.z = t * 0.05 + scrollProgress * 0.4;
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.06 + Math.sin(t * 1.2) * 0.03;
    }
    if (outerRef.current) {
      const p2 = 1 + Math.sin(t * 0.7 + 1.0) * 0.03;
      outerRef.current.scale.setScalar(p2 * s);
      outerRef.current.rotation.z = -t * 0.03 + scrollProgress * 0.4;
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.03 + Math.sin(t * 0.8 + 0.5) * 0.02;
    }
  });

  return (
    <>
      <mesh ref={innerRef}>
        <ringGeometry args={[2.0, 2.5, 128]} />
        <meshBasicMaterial
          color="#0099ff"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={outerRef}>
        <ringGeometry args={[2.4, 3.2, 128]} />
        <meshBasicMaterial
          color="#004488"
          transparent
          opacity={0.03}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

// ── Camera ──────────────────────────────────────────────────────────

function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.z = 6 + scrollProgress * 2;
    camera.position.y = scrollProgress * -0.5;
  });
  return null;
}

// ── Export ───────────────────────────────────────────────────────────

export default function EnsoScene() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollProgress(
        Math.min(window.scrollY / (window.innerHeight * 0.8), 1),
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0"
      style={{ opacity: 1 - scrollProgress * 0.6 }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <CameraRig scrollProgress={scrollProgress} />
        <EnsoGlow scrollProgress={scrollProgress} />
        <EnsoBrush scrollProgress={scrollProgress} />
        <EnsoParticles scrollProgress={scrollProgress} />
        <GlowRings scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
