import React, { useState, useRef } from 'react';
import { MovementId } from '../../../domain/entities/camera-movement.entity.ts';
import { ViewportSimulationState } from '../../../domain/services/cinematic-calculation.service.ts';
import { CustomImageSceneEntity } from '../../../domain/entities/custom-image-scene.entity.ts';
import { Real3DSetView } from './Real3DSetView.tsx';
import { Box, Layers, Move } from 'lucide-react';

interface BehindTheScenesViewProps {
  readonly movementId: MovementId;
  readonly state: ViewportSimulationState;
  readonly progress: number;
  readonly customImageScene?: CustomImageSceneEntity | null;
  readonly onSetCameraPosition?: (x: number, y: number, z: number) => void;
}

export const BehindTheScenesView: React.FC<BehindTheScenesViewProps> = ({
  movementId,
  state,
  progress,
  customImageScene = null,
  onSetCameraPosition,
}) => {
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const isDraggingCamRef = useRef<boolean>(false);

  // Center of set coordinate space: Actor is at (250, 140)
  const actorPos = { x: 250, y: 140 };

  // Calculate top-down camera position on set:
  const baseCamY = 310;
  const setCamX = 250 + state.cameraPosition.x * 0.9;
  const setCamY = baseCamY - state.cameraPosition.z * 0.7;

  // Frustum cone direction from camera angle
  const camAngleDeg = -state.cameraRotation.pan;
  const fovHalfAngle = Math.max(12, Math.min(38, 48 / state.focalMultiplier));

  // Compute frustum end points
  const frustumLength = 170;
  const leftRad = ((camAngleDeg - fovHalfAngle - 90) * Math.PI) / 180;
  const rightRad = ((camAngleDeg + fovHalfAngle - 90) * Math.PI) / 180;

  const frustumLeftX = setCamX + Math.cos(leftRad) * frustumLength;
  const frustumLeftY = setCamY + Math.sin(leftRad) * frustumLength;
  const frustumRightX = setCamX + Math.cos(rightRad) * frustumLength;
  const frustumRightY = setCamY + Math.sin(rightRad) * frustumLength;

  // Handle direct dragging on 2D Set
  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    isDraggingCamRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingCamRef.current || !onSetCameraPosition) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 500;
    const svgY = ((e.clientY - rect.top) / rect.height) * 380;

    // Convert SVG coordinates back to camera simulation coordinates
    const newCamX = (svgX - 250) / 0.9;
    const newCamZ = (baseCamY - svgY) / 0.7;
    onSetCameraPosition(newCamX, state.cameraPosition.y, newCamZ);
  };

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    isDraggingCamRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg border border-neutral-800 bg-[#0c0d12] shadow-2xl">
      {/* Top Controls Bar: Mode 2D Schéma vs Mode 3D Réel */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900/90 p-0.5 shadow-md">
        <button
          type="button"
          onClick={() => setIs3DMode(true)}
          className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
            is3DMode
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Box className="h-3.5 w-3.5" />
          <span>Vue 3D Réelle</span>
        </button>

        <button
          type="button"
          onClick={() => setIs3DMode(false)}
          className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
            !is3DMode
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Schéma 2D</span>
        </button>
      </div>

      {is3DMode ? (
        /* REAL 3D THREE.JS SET VIEW */
        <Real3DSetView
          movementId={movementId}
          state={state}
          progress={progress}
          customImageScene={customImageScene}
          onSetCameraPosition={onSetCameraPosition}
        />
      ) : (
        /* 2D ISOMETRIC SCHEMATIC VIEW WITH DIRECT DRAG TO REPOSITION */
        <div className="relative h-full w-full">
          {/* Header Label */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono-tech uppercase tracking-wider text-emerald-400 font-semibold">
              Vue Plateau 2D · Glissez la Caméra
            </span>
          </div>

          <svg
            viewBox="0 0 500 380"
            onPointerDown={handleSvgPointerDown}
            onPointerMove={handleSvgPointerMove}
            onPointerUp={handleSvgPointerUp}
            className="h-full w-full select-none cursor-crosshair"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="setGrid2" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1f2430" strokeWidth="0.8" />
              </pattern>
              <linearGradient id="frustumGlow2" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
              </linearGradient>
              <radialGradient id="spotLightActor2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Set floor grid */}
            <rect width="500" height="380" fill="#090a0f" />
            <rect width="500" height="380" fill="url(#setGrid2)" opacity="0.7" />

            {/* Studio perimeter walls */}
            <line x1="40" y1="40" x2="460" y2="40" stroke="#2a303c" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="40" y1="40" x2="40" y2="350" stroke="#2a303c" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="460" y1="40" x2="460" y2="350" stroke="#2a303c" strokeWidth="2" strokeDasharray="4 4" />

            {/* Dolly Rails */}
            <g>
              <line x1="230" y1="180" x2="230" y2="340" stroke="#475569" strokeWidth="3" />
              <line x1="270" y1="180" x2="270" y2="340" stroke="#475569" strokeWidth="3" />
              {[200, 230, 260, 290, 320].map((tieY) => (
                <line key={tieY} x1="225" y1={tieY} x2="275" y2={tieY} stroke="#334155" strokeWidth="2" />
              ))}
            </g>

            {/* Actor on Set */}
            <g>
              <ellipse cx={actorPos.x} cy={actorPos.y} rx="45" ry="30" fill="url(#spotLightActor2)" />
              <line x1={actorPos.x - 8} y1={actorPos.y - 8} x2={actorPos.x + 8} y2={actorPos.y + 8} stroke="#ef4444" strokeWidth="2" />
              <line x1={actorPos.x + 8} y1={actorPos.y - 8} x2={actorPos.x - 8} y2={actorPos.y + 8} stroke="#ef4444" strokeWidth="2" />
              <ellipse cx={actorPos.x} cy={actorPos.y} rx="14" ry="8" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
              <circle cx={actorPos.x} cy={actorPos.y} r="8" fill="#f59e0b" />
              <text
                x={actorPos.x}
                y={actorPos.y - 18}
                fill="#e2e8f0"
                fontSize="10"
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight="bold"
              >
                SUJET
              </text>
            </g>

            {/* Camera Frustum Cone */}
            <polygon
              points={`${setCamX},${setCamY} ${frustumLeftX},${frustumLeftY} ${frustumRightX},${frustumRightY}`}
              fill="url(#frustumGlow2)"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="4 2"
              opacity="0.8"
            />

            {/* Interactive Camera Rig Icon */}
            <g
              transform={`translate(${setCamX}, ${setCamY}) rotate(${camAngleDeg})`}
              className="cursor-grab active:cursor-grabbing"
            >
              <rect x="-22" y="-18" width="44" height="36" rx="4" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
              <polygon points="-8,-18 8,-18 12,-32 -12,-32" fill="#27272a" stroke="#f59e0b" strokeWidth="1.5" />
              <ellipse cx="0" cy="-32" rx="12" ry="4" fill="#0284c7" />
              <circle cx="12" cy="-6" r="3" fill="#ef4444" className="animate-pulse" />
            </g>

            {/* Direct Drag Hint */}
            <g transform="translate(15, 360)">
              <text fill="#a1a1aa" fontSize="10" fontFamily="monospace">
                👆 Cliquez & glissez n'importe où sur le plateau pour repositionner la caméra
              </text>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};
