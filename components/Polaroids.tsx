
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { TreeMode } from '../types';

/**
 * ==================================================================================
 *  INSTRUCTIONS FOR LOCAL PHOTOS
 * ==================================================================================
 * 1. Create a folder named "photos" inside your "public" directory.
 *    (e.g., public/photos/)
 * 
 * 2. Place your JPG images in there.
 * 
 * 3. Rename them sequentially:
 *    1.jpg, 2.jpg, 3.jpg ... up to 13.jpg
 * 
 *    If a file is missing (e.g., you only have 5 photos), the frame will 
 *    display a placeholder instead of crashing the app.
 * ==================================================================================
 */

const PHOTO_COUNT = 22; // How many polaroid frames to generate

interface PolaroidsProps {
  mode: TreeMode;
  uploadedPhotos: string[];
  photoDisplayMode?: 'random' | 'sequential';
  photoLabels?: string[];
}

interface PhotoData {
  id: number;
  url: string;
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  pinchPos: THREE.Vector3;
  speed: number;
  isSelected: boolean;
  label: string;
}

const PolaroidItem: React.FC<{ data: PhotoData; mode: TreeMode; index: number; photoLabel?: string }> = ({ data, mode, index, photoLabel = "Happy Memories" }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState(false);
  
  // Cache frequently used values
  const cameraPos = useMemo(() => new THREE.Vector3(0, 9, 20), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Safe texture loading that won't crash the app if a file is missing
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      data.url,
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTex);
        setError(false);
      },
      undefined, // onProgress
      (err) => {
        console.warn(`Failed to load image: ${data.url}`, err);
        setError(true);
      }
    );
  }, [data.url]);
  
  // Random sway offset
  const swayOffset = useMemo(() => Math.random() * 100, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const isFormed = mode === TreeMode.FORMED;
    const isPinch = mode === TreeMode.PINCH;
    const time = state.clock.elapsedTime;
    
    // 1. Position Interpolation
    let targetPos;
    if (isPinch && data.isSelected) {
      // Only selected photo moves to pinch position
      targetPos = data.pinchPos;
    } else if (isFormed) {
      targetPos = data.targetPos;
    } else {
      targetPos = data.chaosPos;
    }
    
    const step = delta * data.speed * 2.0; // Further increased speed for smoother animation
    groupRef.current.position.lerp(targetPos, step);

    // 2. Rotation & Sway Logic
    if (isPinch && data.isSelected) {
      // Pinch mode - selected photo flies to front center and faces camera with scaling effect
      const pinchCameraPos = new THREE.Vector3(0, 0, 8); // Adjusted camera position for direct viewing
      dummy.position.copy(groupRef.current.position);
      dummy.lookAt(pinchCameraPos);
      
      // Smoothly rotate to face camera
      groupRef.current.quaternion.slerp(dummy.quaternion, delta * 12); // Further increased speed for smoother animation
      
      // Add subtle floating animation for a more dynamic feel
      const floatX = Math.sin(time * 0.8 + swayOffset) * 0.01;
      const floatY = Math.cos(time * 0.6 + swayOffset) * 0.01;
      
      // Apply floating to position
      groupRef.current.position.x += floatX;
      groupRef.current.position.y += floatY;
      
      // Scale effect for pinch mode - larger for better visibility
      const scaleTarget = 4.0; // Increased scale for better visibility
      groupRef.current.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), delta * 8); // Further increased speed for smoother animation
      
      // Ensure photo is perfectly flat and facing forward - override any rotation
      groupRef.current.rotation.z = 0;
      groupRef.current.rotation.x = 0;
      groupRef.current.rotation.y = 0; // Explicitly set Y rotation to 0 for perfect front-facing
      
    } else if (isFormed) {
      // Formed mode - photos attach to tree and face outward with natural swaying
      dummy.position.copy(groupRef.current.position);
      dummy.lookAt(0, groupRef.current.position.y, 0); 
      dummy.rotateY(Math.PI); // Flip to face out
      
      // Base rotation alignment
      groupRef.current.quaternion.slerp(dummy.quaternion, delta * 7); // Further increased speed for smoother animation
      
      // Physical Swaying (Wind)
      const swayAngle = Math.sin(time * 2.0 + swayOffset) * 0.08; // Original frequency and amplitude
      const tiltAngle = Math.cos(time * 1.5 + swayOffset) * 0.05; // Original frequency and amplitude
      
      const currentRot = new THREE.Euler().setFromQuaternion(groupRef.current.quaternion);
      groupRef.current.rotation.z = currentRot.z + swayAngle * 0.1; 
      groupRef.current.rotation.x = currentRot.x + tiltAngle * 0.1;
      
      // Reset scale to normal
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 7); // Further increased speed for smoother animation
      
    } else {
      // Chaos mode - face toward camera with gentle floating
      dummy.position.copy(groupRef.current.position);
      dummy.lookAt(cameraPos);
      
      // Smoothly rotate to face camera
      groupRef.current.quaternion.slerp(dummy.quaternion, delta * 7); // Further increased speed for smoother animation
      
      // Add gentle floating wobble
      const wobbleX = Math.sin(time * 1.5 + swayOffset) * 0.03; // Original amplitude
      const wobbleZ = Math.cos(time * 1.2 + swayOffset) * 0.03; // Original amplitude
      
      const currentRot = new THREE.Euler().setFromQuaternion(groupRef.current.quaternion);
      groupRef.current.rotation.x = currentRot.x + wobbleX;
      groupRef.current.rotation.z = currentRot.z + wobbleZ;
      
      // Reset scale to normal
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 7); // Further increased speed for smoother animation
    }
  });

  return (
    <group ref={groupRef}>
      
      {/* The Hanging String (Visual only) - fades out at top */}
      <mesh position={[0, 1.2, -0.1]}>
        <cylinderGeometry args={[0.005, 0.005, 1.5]} />
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} transparent opacity={0.6} />
      </mesh>

      {/* Frame Group (Offset slightly so string connects to top center) */}
      <group position={[0, 0, 0]}>
        
        {/* White Paper Backing */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 1.5, 0.02]} />
          <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
        </mesh>

        {/* The Photo Area */}
        <mesh position={[0, 0.15, 0.025]}>
          <planeGeometry args={[1.0, 1.0]} />
          {texture && !error ? (
            <meshBasicMaterial map={texture} />
          ) : (
            // Fallback Material (Red for error, Grey for loading)
            <meshStandardMaterial color={error ? "#550000" : "#cccccc"} />
          )}
        </mesh>
        
        {/* "Tape" or Gold Clip */}
        <mesh position={[0, 0.7, 0.025]} rotation={[0,0,0]}>
           <boxGeometry args={[0.1, 0.05, 0.05]} />
           <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
        </mesh>

        {/* Text Label */}
        <Text
          position={[0, -0.55, 0.03]}
          fontSize={0.12}
          color="#333"
          anchorX="center"
          anchorY="middle"
        >
          {error ? "Image not found" : photoLabel}
        </Text>
      </group>
    </group>
  );
};

export const Polaroids: React.FC<PolaroidsProps> = ({ mode, uploadedPhotos, photoDisplayMode = 'random', photoLabels }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [sequentialIndex, setSequentialIndex] = useState<number>(0); // Track current index for sequential mode
  
  // Select a photo when entering PINCH mode
  useEffect(() => {
    if (mode === TreeMode.PINCH && uploadedPhotos.length > 0) {
      if (selectedPhotoIndex === null) {
        let newIndex;
        if (photoDisplayMode === 'random') {
          // Random mode: select a random photo
          newIndex = Math.floor(Math.random() * uploadedPhotos.length);
        } else {
          // Sequential mode: use the current sequential index
          newIndex = sequentialIndex;
          // Update for next time
          setSequentialIndex((prev) => (prev + 1) % uploadedPhotos.length);
        }
        setSelectedPhotoIndex(newIndex);
      }
    } else {
      setSelectedPhotoIndex(null);
    }
  }, [mode, uploadedPhotos.length, selectedPhotoIndex, photoDisplayMode, sequentialIndex]);

  const photoData = useMemo(() => {
    // Don't render any photos if none are uploaded
    if (uploadedPhotos.length === 0) {
      return [];
    }

    const data: PhotoData[] = [];
    const height = 9; // Range of height on tree
    const maxRadius = 5.0; // Slightly outside the foliage radius (which is approx 5 at bottom)
    
    const count = uploadedPhotos.length;

    for (let i = 0; i < count; i++) {
      // 1. Target Position
      // Distributed nicely on the cone surface
      const yNorm = 0.2 + (i / count) * 0.6; // Keep between 20% and 80% height
      const y = yNorm * height;
      
      // Radius decreases as we go up
      const r = maxRadius * (1 - yNorm) + 0.8; // +0.8 to ensure it floats OUTSIDE leaves
      
      // Golden Angle Spiral for even distribution
      const theta = i * 2.39996; // Golden angle in radians
      
      const targetPos = new THREE.Vector3(
        r * Math.cos(theta),
        y,
        r * Math.sin(theta)
      );

      // 2. Chaos Position - Spread out and closer to camera
      // Camera is at [0, 4, 20], Scene group offset is [0, -5, 0]
      // So relative to scene, camera is at y=9
      const relativeY = 5; // Lower position for better visibility
      const relativeZ = 20; // Camera Z
      
      // Create positions spread widely around camera, very close
      const angle = (i / count) * Math.PI * 2; // Distribute evenly
      const distance = 3 + Math.random() * 4; // Distance 3-7 units (very close)
      const heightSpread = (Math.random() - 0.5) * 8; // Height variation -4 to +4 (more spread)
      
      const chaosPos = new THREE.Vector3(
        distance * Math.cos(angle) * 1.2, // X spread wider
        relativeY + heightSpread, // More vertical spread
        relativeZ - 4 + distance * Math.sin(angle) * 0.5 // Very close to camera (Z ~16-19)
      );

      data.push({
        id: i,
        url: uploadedPhotos[i],
        chaosPos,
        targetPos,
        pinchPos: new THREE.Vector3(
          0, // Center horizontally
          8, // Center vertically at eye level
          8 // Position closer to camera for better visibility
        ),
        speed: 0.8 + Math.random() * 1.5, // Variable speed
        isSelected: i === selectedPhotoIndex,
        label: photoLabels && photoLabels[i] ? photoLabels[i] : "Happy Memories"
      });
    }
    return data;
  }, [uploadedPhotos, selectedPhotoIndex]);

  return (
    <group>
      {photoData.map((data, i) => (
        <PolaroidItem key={i} index={i} data={data} mode={mode} photoLabel={data.label} />
      ))}
    </group>
  );
};
