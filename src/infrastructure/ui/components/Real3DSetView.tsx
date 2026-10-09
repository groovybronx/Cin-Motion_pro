import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MovementId } from '../../../domain/entities/camera-movement.entity.ts';
import { ViewportSimulationState } from '../../../domain/services/cinematic-calculation.service.ts';
import { CustomImageSceneEntity } from '../../../domain/entities/custom-image-scene.entity.ts';
import { Move3d, RotateCw, ZoomIn, Eye } from 'lucide-react';

interface Real3DSetViewProps {
  readonly movementId: MovementId;
  readonly state: ViewportSimulationState;
  readonly progress: number;
  readonly customImageScene?: CustomImageSceneEntity | null;
  readonly onSetCameraPosition?: (x: number, y: number, z: number) => void;
}

export const Real3DSetView: React.FC<Real3DSetViewProps> = ({
  movementId,
  state,
  progress,
  customImageScene = null,
  onSetCameraPosition,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const camRigGroupRef = useRef<THREE.Group | null>(null);
  const frustumMeshRef = useRef<THREE.Mesh | null>(null);
  const studioCamRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Orbit control angles
  const orbitAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI * 0.25,
    phi: Math.PI * 0.35,
    radius: 7.5,
  });
  const isPointerDownRef = useRef<boolean>(false);
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 340;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090a0f);
    sceneRef.current = scene;

    // 2. Studio Observer Camera (View from set)
    const observerCam = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    studioCamRef.current = observerCam;

    const updateObserverCamPos = () => {
      const { theta, phi, radius } = orbitAngleRef.current;
      observerCam.position.x = radius * Math.sin(phi) * Math.sin(theta);
      observerCam.position.y = radius * Math.cos(phi);
      observerCam.position.z = radius * Math.sin(phi) * Math.cos(theta);
      observerCam.lookAt(0, 0.8, -0.5);
    };
    updateObserverCamPos();

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xf59e0b, 1.2);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const keySpot = new THREE.SpotLight(0x38bdf8, 2.0, 15, Math.PI * 0.25, 0.5);
    keySpot.position.set(-3, 6, 2);
    keySpot.target.position.set(0, 1, -1.5);
    scene.add(keySpot);
    scene.add(keySpot.target);

    // 5. Floor & Grid
    const gridHelper = new THREE.GridHelper(14, 28, 0xf59e0b, 0x1f2430);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090a0f,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 6. Dolly Rails on floor
    const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    const rail1Geo = new THREE.CylinderGeometry(0.02, 0.02, 6, 16);
    const rail1 = new THREE.Mesh(rail1Geo, railMat);
    rail1.rotation.x = Math.PI / 2;
    rail1.position.set(-0.35, 0.02, 1);
    scene.add(rail1);

    const rail2 = new THREE.Mesh(rail1Geo, railMat);
    rail2.rotation.x = Math.PI / 2;
    rail2.position.set(0.35, 0.02, 1);
    scene.add(rail2);

    // 7. Actor Mesh standing on stage at (0, 0, -1.5)
    const actorGroup = new THREE.Group();
    actorGroup.position.set(0, 0, -1.5);

    // Actor Body
    const coatMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const torsoGeo = new THREE.CylinderGeometry(0.2, 0.28, 1.1, 16);
    const torso = new THREE.Mesh(torsoGeo, coatMat);
    torso.position.y = 0.95;
    actorGroup.add(torso);

    // Actor Head
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
    const headGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.62;
    actorGroup.add(head);

    // Actor Fedor Hat
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x18181b });
    const hatGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.1, 16);
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 1.74;
    actorGroup.add(hat);

    // Stage ground mark 'X'
    const markMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const mark1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.01, 0.06), markMat);
    mark1.rotation.y = Math.PI / 4;
    mark1.position.y = 0.01;
    actorGroup.add(mark1);
    const mark2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.01, 0.06), markMat);
    mark2.rotation.y = -Math.PI / 4;
    mark2.position.y = 0.01;
    actorGroup.add(mark2);

    scene.add(actorGroup);

    // If Custom Image Scene is loaded, display 2.5D multiplane planar cards in 3D space
    if (customImageScene && customImageScene.layers.length > 0) {
      actorGroup.visible = false;
      const multiplaneGroup = new THREE.Group();
      const loader = new THREE.TextureLoader();

      customImageScene.layers.forEach((layer) => {
        if (layer.isVisible === false) return;
        const texture = loader.load(layer.dataUrl);
        texture.colorSpace = THREE.SRGBColorSpace;
        const isBg = layer.role === 'background';
        const planeGeo = new THREE.PlaneGeometry(isBg ? 5.2 : 2.5, isBg ? 3.2 : 2.0);
        const planeMat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: isBg,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        // Position on 3D Z axis according to estimated layer depth
        const zPos = -1.5 + (layer.depthZ / 140) * 1.5;
        mesh.position.set(0, 1.25, zPos);
        multiplaneGroup.add(mesh);
      });
      scene.add(multiplaneGroup);
    }

    // 8. 3D Camera Rig
    const camRigGroup = new THREE.Group();
    camRigGroupRef.current = camRigGroup;

    // Base Dolly Cart
    const cartMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.5 });
    const cart = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.8), cartMat);
    cart.position.y = 0.15;
    camRigGroup.add(cart);

    // Pedestal Column
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.9, 16), railMat);
    column.position.y = 0.65;
    camRigGroup.add(column);

    // Camera Head (Pivot body)
    const camHead = new THREE.Group();
    camHead.position.y = 1.15;

    const camBodyMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.7 });
    const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.45), camBodyMat);
    camHead.add(camBody);

    // Matte Box & Lens (Pointing forward to -Z)
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.25, 16), lensMat);
    lens.rotation.x = -Math.PI / 2;
    lens.position.set(0, 0, -0.28);
    camHead.add(lens);

    // Red REC tally
    const tally = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    tally.position.set(0.12, 0.14, 0);
    camHead.add(tally);

    // 9. Camera Light Frustum Cone (Projecting forward from lens)
    const frustumGeo = new THREE.ConeGeometry(1.2, 3.2, 16, 1, true);
    const frustumMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const frustum = new THREE.Mesh(frustumGeo, frustumMat);
    frustum.rotation.x = Math.PI / 2;
    frustum.position.set(0, 0, -1.8);
    camHead.add(frustum);
    frustumMeshRef.current = frustum;

    camRigGroup.add(camHead);
    scene.add(camRigGroup);

    // Animation render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, observerCam);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 340;
      observerCam.aspect = w / h;
      observerCam.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Synchronize 3D camera position and rotation with simulation state in real time
  useEffect(() => {
    const camRig = camRigGroupRef.current;
    if (!camRig) return;

    // Base position at (0, 0, 1.8) on rails
    const targetX = (state.cameraPosition.x / 160) * 1.5;
    const targetY = (state.cameraPosition.y / 100) * 0.8;
    const targetZ = 1.8 - (state.cameraPosition.z / 140) * 1.6;

    camRig.position.set(targetX, targetY, targetZ);

    // Camera rotations
    const panRad = (-state.cameraRotation.pan * Math.PI) / 180;
    const tiltRad = (state.cameraRotation.tilt * Math.PI) / 180;
    const rollRad = (state.cameraRotation.roll * Math.PI) / 180;

    camRig.rotation.y = panRad;
    camRig.rotation.x = tiltRad;
    camRig.rotation.z = rollRad;

    // Frustum scale inversely proportional to focal multiplier
    if (frustumMeshRef.current) {
      const fovScale = Math.max(0.4, Math.min(2.0, 1.0 / state.focalMultiplier));
      frustumMeshRef.current.scale.set(fovScale, 1.0, fovScale);
    }
  }, [state]);

  // Pointer drag on 3D canvas for orbiting around set
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = true;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !studioCamRef.current) return;
    const dx = e.clientX - lastPointerPosRef.current.x;
    const dy = e.clientY - lastPointerPosRef.current.y;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

    const angles = orbitAngleRef.current;
    angles.theta -= dx * 0.008;
    angles.phi = Math.max(0.15, Math.min(Math.PI * 0.48, angles.phi - dy * 0.008));

    const { theta, phi, radius } = angles;
    const cam = studioCamRef.current;
    cam.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cam.position.y = radius * Math.cos(phi);
    cam.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cam.lookAt(0, 0.8, -0.5);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const handleResetOrbitView = () => {
    orbitAngleRef.current = {
      theta: Math.PI * 0.25,
      phi: Math.PI * 0.35,
      radius: 7.5,
    };
    if (studioCamRef.current) {
      const { theta, phi, radius } = orbitAngleRef.current;
      studioCamRef.current.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
      studioCamRef.current.lookAt(0, 0.8, -0.5);
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="group relative w-full aspect-[16/10] overflow-hidden rounded-lg border border-neutral-800 bg-[#090a0f] shadow-2xl cursor-grab active:cursor-grabbing select-none"
    >
      {/* Three.js Container */}
      <div ref={mountRef} className="h-full w-full" />

      {/* 3D HUD Badge */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs font-mono-tech uppercase tracking-wider text-amber-400 font-semibold drop-shadow">
          Studio 3D Temps Réel · Machinerie & Rails
        </span>
      </div>

      {/* Orbit interaction hint */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded bg-black/60 px-2.5 py-1 text-[10px] font-mono-tech text-neutral-400 border border-neutral-800 backdrop-blur-sm">
        <Move3d className="h-3 w-3 text-amber-400" />
        <span>Faire pivoter la vue 3D du plateau</span>
      </div>

      {/* Reset view button */}
      <button
        type="button"
        onClick={handleResetOrbitView}
        title="Réinitialiser l'angle de vue 3D du studio"
        className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded bg-neutral-900/90 border border-neutral-800 px-2 py-1 text-[10px] text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
      >
        <RotateCw className="h-3 w-3" />
        <span>Recentrer Studio</span>
      </button>
    </div>
  );
};
