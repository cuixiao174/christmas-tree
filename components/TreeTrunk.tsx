import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode } from '../types';

interface TreeTrunkProps {
  mode: TreeMode;
  count: number;
}

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  
  attribute vec3 aChaosPos;
  attribute vec3 aTargetPos;
  attribute float aRandom;
  
  varying vec3 vColor;
  varying float vAlpha;

  // Cubic Ease In Out
  float cubicInOut(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    // Add some individual variation to the progress so they don't all move at once
    float localProgress = clamp(uProgress * 1.2 - aRandom * 0.2, 0.0, 1.0);
    float easedProgress = cubicInOut(localProgress);

    // Interpolate position
    vec3 newPos = mix(aChaosPos, aTargetPos, easedProgress);
    
    // Add a slight "breathing" effect when formed
    if (easedProgress > 0.9) {
      newPos.x += sin(uTime * 1.5 + newPos.y) * 0.02;
      newPos.z += cos(uTime * 1.2 + newPos.y) * 0.02;
    }

    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    
    // Size attenuation - slightly larger than foliage for trunk visibility
    gl_PointSize = (5.0 * aRandom + 3.0) * (20.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // Color logic: Brown trunk colors
    vec3 darkBrown = vec3(0.3, 0.15, 0.05);
    vec3 lightBrown = vec3(0.6, 0.3, 0.1);
    vec3 mediumBrown = vec3(0.45, 0.25, 0.08);
    
    // Mix between brown shades based on random
    vec3 finalBrown = mix(darkBrown, lightBrown, aRandom);
    finalBrown = mix(finalBrown, mediumBrown, sin(aRandom * 3.14159) * 0.5);
    
    // Add slight variation based on height
    float heightFactor = (newPos.y + 2.0) / 4.0; // Normalize height
    finalBrown = mix(finalBrown, darkBrown, heightFactor * 0.3);
    
    vColor = finalBrown;
    vAlpha = 1.0;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Circular particle
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;

    // Soft edge
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

export const TreeTrunk: React.FC<TreeTrunkProps> = ({ mode, count }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Target progress reference for smooth JS-side dampening logic for the uniform
  const progressRef = useRef(0);

  const { chaosPositions, targetPositions, randoms } = useMemo(() => {
    const chaos = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const rnd = new Float32Array(count);

    // Trunk dimensions
    const trunkHeight = 2.0;
    const trunkRadius = 1.0;
    const trunkBottomY = -2; // Position at the bottom of the tree

    for (let i = 0; i < count; i++) {
      // 1. Chaos Positions: Random sphere
      const r = 25 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      chaos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      chaos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 5;
      chaos[i * 3 + 2] = r * Math.cos(phi);

      // 2. Target Positions: Cylinder
      const height = Math.random() * trunkHeight;
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * trunkRadius;
      
      target[i * 3] = Math.cos(angle) * radius;
      target[i * 3 + 1] = trunkBottomY + height;
      target[i * 3 + 2] = Math.sin(angle) * radius;

      // 3. Randoms
      rnd[i] = Math.random();
    }

    return {
      chaosPositions: chaos,
      targetPositions: target,
      randoms: rnd
    };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
  }), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      // Update time
      material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly interpolate the progress uniform
      const target = mode === TreeMode.FORMED ? 1 : 0;
      progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, delta * 3.5);
      material.uniforms.uProgress.value = progressRef.current;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Required by three.js, though we override in shader
          count={count}
          array={chaosPositions} // Initial state
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aChaosPos"
          count={count}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          count={count}
          array={targetPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      {/* @ts-ignore */}
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};