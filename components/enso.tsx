"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ── Enso brush-stroke path ──────────────────────────────────────────
// Generates a tube geometry that looks like a hand-drawn ink circle
// with varying thickness and a traditional gap.

function generateEnsoPoints(segments = 256): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  // Enso goes ~330 degrees (leaving a gap)
  const arc = Math.PI * 1.83;
  const startAngle = Math.PI * 0.6;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = startAngle + t * arc;

    // Slight organic wobble
    const wobbleR = Math.sin(t * Math.PI * 6) * 0.015 + Math.sin(t * Math.PI * 13) * 0.008;
    const wobbleY = Math.cos(t * Math.PI * 8) * 0.01;

    const radius = 2.2 + wobbleR;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius + wobbleY;

    points.push(new THREE.Vector3(x, y, 0));
  }
  return points;
}

// Variable-width tube using a ribbon of triangles
function createEnsoGeometry(points: THREE.Vector3[], segments: number) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < points.length; i++) {
    const t = i / (points.length - 1);

    // Brush-stroke width: thick in the middle, tapering at ends
    const taper = Math.sin(t * Math.PI);
    const width = 0.06 + taper * 0.06;

    // Get normal direction (perpendicular to path)
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dir = new THREE.Vector3().subVectors(next, prev).normalize();
    const normal = new THREE.Vector3(-dir.y, dir.x, 0);

    const p = points[i];

    // Two vertices per point (top and bottom of ribbon)
    positions.push(
      p.x + normal.x * width, p.y + normal.y * width, p.z,
      p.x - normal.x * width, p.y - normal.y * width, p.z,
    );
    uvs.push(t, 0, t, 1);

    if (i < points.length - 1) {
      const vi = i * 2;
      indices.push(vi, vi + 1, vi + 2);
      indices.push(vi + 1, vi + 3, vi + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ── Animated enso brush stroke ──────────────────────────────────────

function EnsoBrush({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [drawProgress, setDrawProgress] = useState(0);

  const { geometry, points } = useMemo(() => {
    const pts = generateEnsoPoints(200);
    const geo = createEnsoGeometry(pts, 200);
    return { geometry: geo, points: pts };
  }, []);

  // Animate drawing in
  useEffect(() => {
    let frame: number;
    let progress = 0;
    const draw = () => {
      progress += 0.006;
      if (progress > 1) progress = 1;
      setDrawProgress(progress);
      if (progress < 1) frame = requestAnimationFrame(draw);
    };
    // Small delay before drawing starts
    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(draw);
    }, 800);
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
      // Gentle breathing rotation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
      // Scroll: rotate and scale slightly
      meshRef.current.rotation.z += scrollProgress * 0.5;
      const s = 1 - scrollProgress * 0.15;
      meshRef.current.scale.setScalar(s);
    }
  });

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uDrawProgress: { value: 0 },
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
          uniform float uDrawProgress;
          uniform vec3 uColor;
          varying vec2 vUv;

          void main() {
            // Draw reveal
            float reveal = smoothstep(uDrawProgress - 0.05, uDrawProgress, vUv.x);
            if (vUv.x > uDrawProgress) discard;

            // Brush-stroke edge softness
            float edge = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

            // Subtle shimmer
            float shimmer = 0.85 + 0.15 * sin(vUv.x * 40.0 + uTime * 2.0);

            // Ink opacity variation
            float inkVar = 0.7 + 0.3 * sin(vUv.x * 20.0 + 1.5);

            float alpha = edge * shimmer * inkVar * (1.0 - reveal * 0.3);

            // Color: white core with accent glow
            vec3 col = mix(uColor, vec3(1.0), edge * 0.6);

            gl_FragColor = vec4(col, alpha * 0.9);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  );

  return (
    <mesh ref={meshRef} geometry={geometry} material={shaderMaterial}>
      <primitive object={shaderMaterial} ref={materialRef} />
    </mesh>
  );
}

// ── Floating particles around the enso ──────────────────────────────

function EnsoParticles({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 120;

  const { positions, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.8 + Math.random() * 1.2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, phases: ph };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(positions[i * 3 + 1], positions[i * 3]);
      const radius = Math.sqrt(
        positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2,
      );
      const drift = t * 0.15 + phases[i];
      arr[i * 3] = Math.cos(angle + drift * 0.3) * (radius + Math.sin(drift) * 0.15);
      arr[i * 3 + 1] = Math.sin(angle + drift * 0.3) * (radius + Math.cos(drift) * 0.15);
      arr[i * 3 + 2] = Math.sin(drift * 1.5) * 0.2;
    }
    posAttr.needsUpdate = true;

    ref.current.rotation.z = scrollProgress * 0.3;
    const s = 1 - scrollProgress * 0.1;
    ref.current.scale.setScalar(s);
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.025}
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

// ── Glow ring ───────────────────────────────────────────────────────

function GlowRing({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
    ref.current.scale.setScalar(pulse * (1 - scrollProgress * 0.15));
    ref.current.rotation.z = scrollProgress * 0.4;
    (ref.current.material as THREE.MeshBasicMaterial).opacity =
      0.04 + Math.sin(state.clock.elapsedTime * 0.5) * 0.015;
  });

  return (
    <mesh ref={ref}>
      <ringGeometry args={[2.0, 2.6, 128]} />
      <meshBasicMaterial
        color="#0099ff"
        transparent
        opacity={0.04}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ── Camera controller ───────────────────────────────────────────────

function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    // Push camera back slightly on scroll
    camera.position.z = 6 + scrollProgress * 2;
    camera.position.y = scrollProgress * -0.5;
  });

  return null;
}

// ── Main exported component ─────────────────────────────────────────

export default function EnsoScene() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.8), 1);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
        <EnsoBrush scrollProgress={scrollProgress} />
        <EnsoParticles scrollProgress={scrollProgress} />
        <GlowRing scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
