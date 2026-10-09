import React, { useRef, useState, useEffect } from 'react';
import { ViewportSimulationState } from '../../../domain/services/cinematic-calculation.service.ts';
import { CustomImageSceneEntity } from '../../../domain/entities/custom-image-scene.entity.ts';
import { ViewfinderOverlay } from './ViewfinderOverlay.tsx';

interface CinematicViewportProps {
  readonly state: ViewportSimulationState;
  readonly showGrid: boolean;
  readonly aspectRatio: '2.39' | '1.85' | '16:9';
  readonly isPlaying: boolean;
  readonly isManualMode: boolean;
  readonly hideHud?: boolean;
  readonly customImageScene?: CustomImageSceneEntity | null;
  readonly onManualDrag?: (deltaX: number, deltaY: number) => void;
  readonly onManualZoom?: (zoomDelta: number) => void;
}

export const CinematicViewport: React.FC<CinematicViewportProps> = ({
  state,
  showGrid,
  aspectRatio,
  isPlaying,
  isManualMode,
  hideHud = false,
  customImageScene = null,
  onManualDrag,
  onManualZoom,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPointerActive, setIsPointerActive] = useState<boolean>(false);
  const [interactiveParallax, setInteractiveParallax] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Étape 4 : Écoute DeviceOrientation (mobile) normalisé de -1 à +1
  useEffect(() => {
    if (!customImageScene) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma: inclinaison gauche/droite (-90 à 90)
        // beta: inclinaison avant/arrière (-180 à 180, ~45 en main)
        const normX = Math.max(-1, Math.min(1, e.gamma / 25));
        const normY = Math.max(-1, Math.min(1, (e.beta - 40) / 25));
        setInteractiveParallax({ dx: normX, dy: normY });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [customImageScene]);

  const {
    backgroundOffset,
    subjectOffset,
    foregroundOffset,
    handheldShake,
    cameraRotation,
    depthOfFieldBlurPx,
  } = state;

  const aspectClass =
    aspectRatio === '2.39'
      ? 'aspect-[21/9]'
      : aspectRatio === '1.85'
      ? 'aspect-[16/10]'
      : 'aspect-[16/9]';

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setIsPointerActive(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    // Calcul de l'interaction de parallaxe au curseur (desktop) normalisée de -1 à +1
    if (customImageScene && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setInteractiveParallax({
        dx: Math.max(-1, Math.min(1, normX)),
        dy: Math.max(-1, Math.min(1, normY)),
      });
    }

    if (!isDraggingRef.current || !onManualDrag) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    onManualDrag(dx, dy);
  };

  const handlePointerLeave = (): void => {
    // Rétablissement doux de l'axe central au départ du pointeur
    setInteractiveParallax({ dx: 0, dy: 0 });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    isDraggingRef.current = false;
    setIsPointerActive(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
    if (!onManualZoom) return;
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.05 : -0.05;
    onManualZoom(zoomDelta);
  };

  // Sorted visible layers from custom image scene if active
  const visibleCustomLayers = customImageScene?.layers
    ? [...customImageScene.layers]
        .filter((l) => l.isVisible !== false)
        .sort((a, b) => a.zIndex - b.zIndex)
    : [];

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className={`group relative w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing select-none ${aspectClass} ${
        isPointerActive ? 'ring-1 ring-amber-500/50' : ''
      }`}
      style={{
        transform: `rotate(${cameraRotation.roll + handheldShake.angle}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Visual grain & lighting vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-radial-[circle_at_center,_transparent_40%,_rgba(0,0,0,0.8)_100%]" />
      <div className="pointer-events-none absolute inset-0 z-10 film-grain opacity-40" />

      {/* Viewfinder HUD Overlay : Cadre et viseur central uniquement */}
      <ViewfinderOverlay
        showGrid={showGrid}
        hideHud={hideHud}
      />

      {customImageScene ? (
        /* Étape 4 : Rendu 2.5D ParallaxViewer avec empilement CSS/Canvas */
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {visibleCustomLayers.map((layer) => {
            const isBg = layer.role === 'background' || layer.zIndex === 1;
            const depthMult = layer.depthFactor ?? (isBg ? 0.2 : 1.0);

            // Amplitude de translation parallaxe interactive (curseur/gyro)
            const PARALLAX_MAX_PX = 32;
            const interactiveX = interactiveParallax.dx * depthMult * PARALLAX_MAX_PX;
            const interactiveY = interactiveParallax.dy * depthMult * PARALLAX_MAX_PX;

            // Déplacement cinématographique (moteur de caméra de l'application)
            const motionX = isBg
              ? backgroundOffset.x * depthMult + handheldShake.x * 0.2
              : subjectOffset.x * depthMult + handheldShake.x;

            const motionY = isBg
              ? backgroundOffset.y * depthMult + handheldShake.y * 0.2
              : subjectOffset.y * depthMult + handheldShake.y;

            const totalTransX = motionX + interactiveX;
            const totalTransY = motionY + interactiveY;

            // Spécification technique :
            // Calque 1 (background) : Échelle fixe scale(1.15) pour absorber les bords
            // Calque 2 (foreground/sujet) : Échelle scale(1.0)
            const baseScale = isBg ? 1.15 : 1.0;
            const finalScale = isBg
              ? baseScale * backgroundOffset.scale
              : baseScale * subjectOffset.scale;

            // Profondeur de champ dynamique
            const dynamicBlur = isBg
              ? Math.max(0, layer.blurPx + depthOfFieldBlurPx * 0.5)
              : Math.max(0, layer.blurPx);

            return (
              <div
                key={layer.id}
                className={`absolute transition-transform duration-100 ease-out flex items-center justify-center ${
                  isBg ? 'inset-[-15%]' : 'inset-0'
                }`}
                style={{
                  transform: `translate3d(${totalTransX}px, ${totalTransY}px, 0) scale(${finalScale})`,
                  filter: dynamicBlur > 0 ? `blur(${dynamicBlur}px)` : undefined,
                  opacity: layer.opacity ?? 1,
                  zIndex: layer.zIndex * 10,
                }}
              >
                <img
                  src={layer.dataUrl}
                  alt={layer.label || layer.id}
                  className={`h-full w-full ${
                    isBg
                      ? 'object-cover'
                      : 'object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]'
                  }`}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* DEFAULT VECTOR 3D STUDIO SCENE */
        <>
          {/* Layer 1: Distant Background (Skyline & Studio architecture) */}
          <div
            className="absolute inset-[-15%] flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${backgroundOffset.x + handheldShake.x * 0.3}px, ${
                backgroundOffset.y + handheldShake.y * 0.3
              }px, 0) scale(${backgroundOffset.scale})`,
              filter: `blur(${Math.max(0.5, depthOfFieldBlurPx * 0.6)}px)`,
            }}
          >
            <svg
              viewBox="0 0 1000 600"
              className="h-full w-full object-cover"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="60%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#431407" />
                </linearGradient>
                <linearGradient id="glowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Sky backdrop */}
              <rect width="1000" height="600" fill="url(#skyGrad)" />
              <rect y="350" width="1000" height="250" fill="url(#glowGrad)" />

              {/* Distant neon horizon & buildings */}
              <g fill="#171720" opacity="0.85">
                <rect x="60" y="240" width="55" height="260" rx="3" />
                <rect x="130" y="280" width="70" height="220" rx="2" />
                <rect x="220" y="210" width="85" height="290" rx="4" />
                <rect x="330" y="260" width="60" height="240" rx="2" />
                <rect x="410" y="190" width="100" height="310" rx="4" />
                <rect x="530" y="250" width="75" height="250" rx="3" />
                <rect x="625" y="200" width="90" height="300" rx="3" />
                <rect x="735" y="270" width="80" height="230" rx="2" />
                <rect x="835" y="230" width="110" height="270" rx="4" />
              </g>

              {/* Distant window lights */}
              <g fill="#fbbf24" opacity="0.35">
                <circle cx="250" cy="240" r="1.5" />
                <circle cx="260" cy="270" r="1.5" />
                <circle cx="440" cy="220" r="1.5" />
                <circle cx="470" cy="260" r="1.5" />
                <circle cx="650" cy="230" r="1.5" />
                <circle cx="670" cy="280" r="1.5" />
                <circle cx="870" cy="250" r="1.5" />
              </g>

              {/* Studio stage floor lines */}
              <line x1="0" y1="460" x2="1000" y2="460" stroke="#334155" strokeWidth="2" opacity="0.5" />
              <line x1="100" y1="460" x2="0" y2="600" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="300" y1="460" x2="150" y2="600" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="500" y1="460" x2="500" y2="600" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="700" y1="460" x2="850" y2="600" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="900" y1="460" x2="1000" y2="600" stroke="#1e293b" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Layer 2: Midground Elements (Street lamp, props, environmental columns) */}
          <div
            className="absolute inset-[-10%] flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${subjectOffset.x * 0.4 + handheldShake.x * 0.6}px, ${
                subjectOffset.y * 0.4 + handheldShake.y * 0.6
              }px, 0) scale(${1.0 + (subjectOffset.scale - 1) * 0.5})`,
            }}
          >
            <svg
              viewBox="0 0 1000 600"
              className="h-full w-full object-cover"
              preserveAspectRatio="xMidYMid slice"
            >
              <g>
                <path d="M 210 260 L 220 260 L 218 470 L 212 470 Z" fill="#2d3748" />
                <circle cx="215" cy="250" r="12" fill="#f59e0b" opacity="0.25" />
                <circle cx="215" cy="250" r="5" fill="#fef08a" />
              </g>

              <g opacity="0.8">
                <rect x="760" y="310" width="80" height="40" rx="4" fill="#18181b" stroke="#3f3f46" />
                <text
                  x="800"
                  y="335"
                  fill="#f59e0b"
                  fontSize="12"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  STUDIO A
                </text>
              </g>
            </svg>
          </div>

          {/* Layer 3: Central Subject (Cinematographic Actor Silhouette with lighting rim) */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${subjectOffset.x + handheldShake.x}px, ${
                subjectOffset.y + handheldShake.y
              }px, 0) scale(${subjectOffset.scale})`,
            }}
          >
            <svg
              viewBox="0 0 400 400"
              className="h-72 w-72 drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
            >
              <defs>
                <radialGradient id="actorRim" cx="40%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#18181b" />
                  <stop offset="100%" stopColor="#09090b" />
                </radialGradient>
                <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.15" />
                </filter>
              </defs>

              <ellipse cx="200" cy="355" rx="55" ry="12" fill="#000000" opacity="0.65" />

              <g filter="url(#shadowFilter)">
                <path
                  d="M 170 120 C 170 100, 230 100, 230 120 C 245 122, 250 128, 235 130 C 210 133, 190 133, 165 130 C 150 128, 155 122, 170 120 Z"
                  fill="url(#actorRim)"
                  stroke="#d97706"
                  strokeWidth="1"
                />
                <ellipse cx="200" cy="138" rx="18" ry="20" fill="url(#actorRim)" />
                <path
                  d="M 160 170 L 180 155 L 200 162 L 220 155 L 240 170 L 255 210 L 245 310 L 155 310 L 145 210 Z"
                  fill="url(#actorRim)"
                  stroke="#b45309"
                  strokeWidth="0.8"
                />
                <line x1="200" y1="162" x2="200" y2="310" stroke="#27272a" strokeWidth="2" />
                <path d="M 175 220 L 225 220" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
                <rect x="175" y="310" width="18" height="42" fill="#18181b" rx="2" />
                <rect x="207" y="310" width="18" height="42" fill="#18181b" rx="2" />
                <ellipse cx="182" cy="352" rx="12" ry="4" fill="#09090b" />
                <ellipse cx="218" cy="352" rx="12" ry="4" fill="#09090b" />
              </g>
            </svg>
          </div>

          {/* Layer 4: Foreground Elements (Parallax framing) */}
          <div
            className="pointer-events-none absolute inset-[-20%] transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${foregroundOffset.x + handheldShake.x * 1.5}px, ${
                foregroundOffset.y + handheldShake.y * 1.5
              }px, 0) scale(${foregroundOffset.scale})`,
              filter: 'blur(3px)',
            }}
          >
            <svg
              viewBox="0 0 1000 600"
              className="h-full w-full object-cover"
              preserveAspectRatio="xMidYMid slice"
            >
              <path d="M 850 0 L 1000 0 L 1000 180 L 880 120 Z" fill="#030712" opacity="0.9" />
              <circle cx="890" cy="110" r="8" fill="#f59e0b" opacity="0.1" />
              <path
                d="M 0 350 Q 80 400 60 600 L 0 600 Z"
                fill="#030712"
                opacity="0.92"
              />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

