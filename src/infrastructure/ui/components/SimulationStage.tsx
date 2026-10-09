import React from 'react';
import { MovementId } from '../../../domain/entities/camera-movement.entity.ts';
import { ViewportSimulationState } from '../../../domain/services/cinematic-calculation.service.ts';
import { CustomImageSceneEntity } from '../../../domain/entities/custom-image-scene.entity.ts';
import { BehindTheScenesView } from './BehindTheScenesView.tsx';
import { CinematicViewport } from './CinematicViewport.tsx';
import { StageViewMode } from './TimelineController.tsx';

interface SimulationStageProps {
  readonly movementId: MovementId;
  readonly state: ViewportSimulationState;
  readonly progress: number;
  readonly isPlaying: boolean;
  readonly showGrid: boolean;
  readonly aspectRatio: '2.39' | '1.85' | '16:9';
  readonly viewMode: StageViewMode;
  readonly hideHud?: boolean;
  readonly customImageScene?: CustomImageSceneEntity | null;
}

export const SimulationStage: React.FC<SimulationStageProps> = ({
  movementId,
  state,
  progress,
  isPlaying,
  showGrid,
  aspectRatio,
  viewMode,
  hideHud = false,
  customImageScene = null,
}) => {
  return (
    <section className="relative w-full">
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          {/* Left View: Cinematic Viewfinder */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1 text-xs text-neutral-400">
              <span className="font-semibold text-neutral-200">
                1. Ce que voit la Caméra {hideHud ? '(Rendu Épuré)' : '(Viseur)'}
              </span>
              <span className="font-mono-tech text-amber-400">
                {customImageScene ? 'Image Personnelle 2.5D' : 'Rendu Optique Direct'}
              </span>
            </div>
            <CinematicViewport
              state={state}
              showGrid={showGrid}
              aspectRatio={aspectRatio}
              isPlaying={isPlaying}
              isManualMode={false}
              hideHud={hideHud}
              customImageScene={customImageScene}
            />
          </div>

          {/* Right View: Behind The Scenes 3D Set */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1 text-xs text-neutral-400">
              <span className="font-semibold text-neutral-200">2. Ce qui se passe sur le Plateau (Machinerie)</span>
              <span className="font-mono-tech text-emerald-400">Trajectoire Réelle 3D</span>
            </div>
            <BehindTheScenesView
              movementId={movementId}
              state={state}
              progress={progress}
              customImageScene={customImageScene}
            />
          </div>
        </div>
      ) : viewMode === 'viewfinder' ? (
        <div className="mx-auto max-w-4xl">
          <CinematicViewport
            state={state}
            showGrid={showGrid}
            aspectRatio={aspectRatio}
            isPlaying={isPlaying}
            isManualMode={false}
            hideHud={hideHud}
            customImageScene={customImageScene}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-4xl">
          <BehindTheScenesView
            movementId={movementId}
            state={state}
            progress={progress}
            customImageScene={customImageScene}
          />
        </div>
      )}
    </section>
  );
};
