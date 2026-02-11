"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ── Full circle path ──────────────────────────────────────────────────

function generateCirclePoints(segments = 256): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = Math.PI * 0.5 + t * Math.PI * 2;
    // Organic wobble for hand-drawn feel
    const wobbleR =
      Math.sin(t * Math.PI * 6) * 0.012 +
      Math.sin(t * Math.PI * 13) * 0.006;
    const wobbleY = Math.cos(t * Math.PI * 8) * 0.008;
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

function createCircleGeometry(
  points: THREE.Vector3[],
  widthMultiplier = 1,
) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const len = points.length;

  for (let i = 0; i < len; i++) {
    const t = i / (len - 1);
    // Periodic width variation (seamless at join)
    const variation = 0.85 + 0.15 * Math.sin(t * Math.PI * 4);
    const width = (0.06 + 0.05 * variation) * widthMultiplier;

    // Wrap-safe direction vectors for smooth normals at the seam
    const prev = i > 0 ? points[i - 1] : points[len - 2];
    const next = i < len - 1 ? points[i + 1] : points[1];
    const dir = new THREE.Vector3().subVectors(next, prev).normalize();
    const normal = new THREE.Vector3(-dir.y, dir.x, 0);
    const p = points[i];

    positions.push(
      p.x + normal.x * width,
      p.y + normal.y * width,
      p.z,
      p.x - normal.x * width,
      p.y - normal.y * width,
      p.z,
    );
    uvs.push(t, 0, t, 1);

    if (i < len - 1) {
      const vi = i * 2;
      indices.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ── Main brush stroke ─────────────────────────────────────────────────

function CircleBrush({
  scrollProgress,
  drawProgress,
}: {
  scrollProgress: number;
  drawProgress: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const pts = generateCirclePoints(256);
    return createCircleGeometry(pts);
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

            // Traveling light pulse
            float pulse1 = fract(uTime * 0.12);
            float pulse2 = fract(uTime * 0.12 + 0.5);
            float glow1 = exp(-pow((vUv.x - pulse1) * 8.0, 2.0));
            float glow2 = exp(-pow((vUv.x - pulse2) * 8.0, 2.0)) * 0.6;
            float travelGlow = glow1 + glow2;

            // Ambient breathing
            float breathe = 0.55 + 0.2 * sin(uTime * 1.2) + 0.1 * sin(uTime * 2.7 + 1.0);

            // Ink texture
            float inkVar = 0.8 + 0.2 * sin(vUv.x * 25.0 + uTime * 0.5);

            float baseAlpha = edge * inkVar * breathe;
            float glowAlpha = travelGlow * edge * 1.5;

            vec3 baseCol = mix(uColor, vec3(1.0), edge * 0.3);
            vec3 glowCol = mix(uGlowColor, vec3(1.0), 0.5);
            vec3 finalCol = mix(baseCol, glowCol, clamp(travelGlow, 0.0, 1.0));

            float alpha = clamp(baseAlpha + glowAlpha, 0.0, 1.0);

            // Drawing edge fade — dissolves as circle completes so the seam closes
            float edgeFade = smoothstep(uDrawProgress, uDrawProgress - 0.08, vUv.x);
            float completion = smoothstep(0.92, 1.0, uDrawProgress);
            alpha *= mix(edgeFade, 1.0, completion);

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

// ── Outer glow layer ──────────────────────────────────────────────────

function CircleGlow({
  scrollProgress,
  drawProgress,
}: {
  scrollProgress: number;
  drawProgress: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const pts = generateCirclePoints(256);
    return createCircleGeometry(pts, 3.5);
  }, []);

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
            if (vUv.x > uDrawProgress) discard;

            float edge = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
            float breathe = 0.3 + 0.15 * sin(uTime * 1.2) + 0.1 * sin(uTime * 0.7);

            float pulse = fract(uTime * 0.12);
            float glow = exp(-pow((vUv.x - pulse) * 6.0, 2.0)) * 0.5;

            float alpha = edge * (breathe * 0.15 + glow);

            // Match the closing fade from main brush
            float edgeFade = smoothstep(uDrawProgress, uDrawProgress - 0.05, vUv.x);
            float completion = smoothstep(0.92, 1.0, uDrawProgress);
            alpha *= mix(edgeFade, 1.0, completion);

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
      materialRef.current.uniforms.uDrawProgress.value = drawProgress;
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

// ── Background effect (reveals after circle completes) ────────────────

function BackgroundEffect({
  revealProgress,
}: {
  revealProgress: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uReveal: { value: 0 },
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
          uniform float uReveal;
          uniform vec3 uColor;
          varying vec2 vUv;

          void main() {
            vec2 center = vUv - 0.5;
            float dist = length(center);

            // ─── Soft radial glow (with breathing) ───
            float breathe = 0.85 + 0.15 * sin(uTime * 0.8);
            float glow = exp(-dist * 3.5) * 0.1 * breathe;

            // ─── Completion bloom (peaks early then fades) ───
            float bloomPhase = smoothstep(0.0, 0.15, uReveal) * smoothstep(0.55, 0.15, uReveal);
            float bloom = exp(-dist * 2.0) * bloomPhase * 0.25;

            // ─── Concentric expanding rings ───
            float ringPhase = dist * 8.0 - uTime * 0.35;
            float ring = sin(ringPhase);
            ring = pow(max(ring, 0.0), 20.0);
            ring *= smoothstep(0.05, 0.15, dist) * smoothstep(0.65, 0.35, dist);
            ring *= 0.035;

            // ─── Combine with reveal ───
            float alpha = (glow + bloom + ring) * smoothstep(0.0, 0.3, uReveal);

            gl_FragColor = vec4(uColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uReveal.value = revealProgress;
    }
  });

  return (
    <mesh position={[0, 0, -2]}>
      <planeGeometry args={[30, 30]} />
      <primitive
        object={shaderMaterial}
        ref={materialRef}
        attach="material"
      />
    </mesh>
  );
}

// ── Camera ────────────────────────────────────────────────────────────

function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.z = 6 + scrollProgress * 2;
    camera.position.y = scrollProgress * -0.5;
  });
  return null;
}

// ── Export ─────────────────────────────────────────────────────────────

export default function EnsoScene() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [drawProgress, setDrawProgress] = useState(0);
  const [revealProgress, setRevealProgress] = useState(0);
  const revealStarted = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      setScrollProgress(
        Math.min(window.scrollY / (window.innerHeight * 0.8), 1),
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  // Reveal background after draw completes
  useEffect(() => {
    if (drawProgress < 1 || revealStarted.current) return;
    revealStarted.current = true;

    let frame: number;
    let reveal = 0;
    const animate = () => {
      reveal += 0.008;
      if (reveal > 1) reveal = 1;
      setRevealProgress(reveal);
      if (reveal < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [drawProgress]);

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
        <BackgroundEffect revealProgress={revealProgress} />
        <CircleGlow
          scrollProgress={scrollProgress}
          drawProgress={drawProgress}
        />
        <CircleBrush
          scrollProgress={scrollProgress}
          drawProgress={drawProgress}
        />
      </Canvas>
    </div>
  );
}
