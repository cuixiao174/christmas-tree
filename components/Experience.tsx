
import React, { useRef } from 'react';
import { Environment, OrbitControls, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Polaroids } from './Polaroids';
import { TreeStar } from './TreeStar';
import { TreeTrunk } from './TreeTrunk';
import { TreeMode } from '../types';

interface ExperienceProps {
  mode: TreeMode;
  handPosition: { x: number; y: number; detected: boolean };
  uploadedPhotos: string[];
  photoDisplayMode?: 'random' | 'sequential';
  photoLabels?: string[];
}

export const Experience: React.FC<ExperienceProps> = ({ mode, handPosition, uploadedPhotos, photoDisplayMode = 'random', photoLabels = [] }) => {
  const controlsRef = useRef<any>(null);
  
  // Store previous hand position to calculate movement
  const prevHandPos = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const MOVEMENT_THRESHOLD = 0.005; // Lower threshold for more responsive camera control

  // Update camera rotation based on hand position
  useFrame((_, delta) => {
    if (controlsRef.current && handPosition.detected) {
      // Calculate movement distance
      const movement = Math.hypot(
        handPosition.x - prevHandPos.current.x,
        handPosition.y - prevHandPos.current.y
      );
      
      // Only update camera if movement exceeds threshold
      if (movement > MOVEMENT_THRESHOLD) {
        const controls = controlsRef.current;
        
        // Map hand position to spherical coordinates
        // x: 0 (left) to 1 (right) -> azimuthal angle (horizontal rotation)
        // y: 0 (top) to 1 (bottom) -> polar angle (vertical tilt)
        
        // Target azimuthal angle: increased range for larger rotation
        const targetAzimuth = (handPosition.x - 0.5) * Math.PI * 2; // Original sensitivity
        
        // Adjust Y mapping so natural hand position gives best view
        // Offset Y so hand at 0.4-0.5 range gives centered view
        const adjustedY = (handPosition.y - 0.2) * 1.5; // Original sensitivity
        const clampedY = Math.max(0, Math.min(1, adjustedY)); // Clamp to 0-1
        
        // Target polar angle: PI/4 to PI/1.8 (constrained vertical angle)
        const minPolar = Math.PI / 4;
        const maxPolar = Math.PI / 1.8;
        const targetPolar = minPolar + clampedY * (maxPolar - minPolar);
        
        // Get current angles
        const currentAzimuth = controls.getAzimuthalAngle();
        const currentPolar = controls.getPolarAngle();
        
        // Calculate angle differences (handle wrapping for azimuth)
        let azimuthDiff = targetAzimuth - currentAzimuth;
        if (azimuthDiff > Math.PI) azimuthDiff -= Math.PI * 2;
        if (azimuthDiff < -Math.PI) azimuthDiff += Math.PI * 2;
        
        // Smoothly interpolate angles with optimized speed
        const lerpSpeed = 10; // Further increased speed for smoother, more responsive camera control
        const newAzimuth = currentAzimuth + azimuthDiff * delta * lerpSpeed;
        const newPolar = currentPolar + (targetPolar - currentPolar) * delta * lerpSpeed;
        
        // Calculate new camera position in spherical coordinates
        const radius = controls.getDistance();
        
        // Dynamic target Y based on hand position
        // When hand moves up (lower y value), target Y moves down to tree middle
        // When hand moves down (higher y value), target Y moves up to tree top
        const normalizedHandY = Math.max(0, Math.min(1, handPosition.y));
        const targetY = 7 - normalizedHandY * 4; // Range from 7 (top) to 3 (middle)
        
        const x = radius * Math.sin(newPolar) * Math.sin(newAzimuth);
        const y = targetY + radius * Math.cos(newPolar);
        const z = radius * Math.sin(newPolar) * Math.cos(newAzimuth);
        
        // Update camera position and target
        controls.object.position.set(x, y, z);
        controls.target.set(0, targetY, 0);
        controls.update();
        
        // Update previous position
        prevHandPos.current = { x: handPosition.x, y: handPosition.y };
      }
    }
  });
  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={5}
        maxDistance={30}
        enableDamping
        dampingFactor={0.05}
        enabled={true}
      />

      {/* Lighting Setup for Maximum Luxury */}
      <Environment preset="lobby" background={false} blur={0.8} />
      
      <ambientLight intensity={0.2} color="#004422" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.2} 
        penumbra={1} 
        intensity={2} 
        color="#fff5cc" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#D4AF37" />

      <group position={[0, -2, 0]}>
        <Foliage mode={mode} count={12000} />
        <Ornaments mode={mode} count={800} />
        <TreeStar mode={mode} />
        <TreeTrunk mode={mode} count={2000} />
        <ContactShadows 
          position={[0, -1.9, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2} 
          far={10} 
        />
        <Polaroids 
          mode={mode} 
          uploadedPhotos={uploadedPhotos} 
          photoDisplayMode={photoDisplayMode} 
          photoLabels={photoLabels} 
        />
      </group>

      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.5}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>
    </>
  );
};
