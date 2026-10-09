import React from 'react';
import { Play, Pause, RotateCcw, Grid } from 'lucide-react';

export type StageViewMode = 'split' | 'viewfinder' | 'set';

interface TimelineControllerProps {
  readonly isPlaying: boolean;
  readonly progress: number;
  readonly speedMultiplier: number;
  readonly showGrid: boolean;
  readonly aspectRatio: '2.39' | '1.85' | '16:9';
  readonly viewMode: StageViewMode;
  readonly onTogglePlay: () => void;
  readonly onScrub: (value: number) => void;
  readonly onReset: () => void;
  readonly onChangeSpeed: (speed: number) => void;
  readonly onToggleGrid: () => void;
  readonly onChangeAspectRatio: (ratio: '2.39' | '1.85' | '16:9') => void;
  readonly onChangeViewMode: (mode: StageViewMode) => void;
}

export const TimelineController: React.FC<TimelineControllerProps> = ({
  isPlaying,
  progress,
  speedMultiplier,
  showGrid,
  aspectRatio,
  viewMode,
  onTogglePlay,
  onScrub,
  onReset,
  onChangeSpeed,
  onToggleGrid,
  onChangeAspectRatio,
  onChangeViewMode,
}) => {
  const percentDisplay = `${Math.round(progress * 100)}%`;
  const timecodeSeconds = (progress * 4.0).toFixed(2); // 4 seconds total cycle

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900/90 p-4 shadow-xl">
      {/* Barre de défilement temporelle */}
      <div className="flex items-center gap-4">
        <span className="w-16 font-mono-tech text-xs text-neutral-400">
          00:0{timecodeSeconds}
        </span>

        {/* Range slider */}
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={progress}
            onChange={(e) => onScrub(parseFloat(e.target.value))}
            className="w-full accent-amber-500 bg-neutral-800 h-2 rounded-lg cursor-pointer"
            aria-label="Position de la tête de lecture"
          />
        </div>

        <span className="w-12 text-right font-mono-tech text-xs font-semibold text-amber-400">
          {percentDisplay}
        </span>
      </div>

      {/* Barre principale de commande de lecture & affichage */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-neutral-800/60">
        {/* Contrôles de lecture & Vitesse */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            title="Revenir au début"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>LECTURE</span>
              </>
            )}
          </button>

          {/* Sélecteur de vitesse */}
          <div className="flex items-center rounded-md border border-neutral-800 bg-neutral-950 p-0.5">
            {[0.5, 1.0, 2.0].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => onChangeSpeed(speed)}
                className={`rounded px-2.5 py-1 text-xs font-mono-tech transition-colors cursor-pointer ${
                  speedMultiplier === speed
                    ? 'bg-neutral-800 text-amber-400 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Modes de vue du plateau (Vue Double / Viseur Caméra / Plateau 3D) */}
        <div className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-950 p-0.5">
          <button
            type="button"
            onClick={() => onChangeViewMode('split')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'split'
                ? 'bg-neutral-800 text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Vue Double
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('viewfinder')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'viewfinder'
                ? 'bg-neutral-800 text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Viseur Caméra
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('set')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'set'
                ? 'bg-neutral-800 text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Plateau 3D
          </button>
        </div>

        {/* Options de cadrage & grille */}
        <div className="flex items-center gap-2">
          {/* Grille des tiers */}
          <button
            type="button"
            onClick={onToggleGrid}
            title="Afficher/masquer la grille des tiers"
            className={`flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors cursor-pointer ${
              showGrid
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Grille</span>
          </button>

          {/* Format d'image (Aspect Ratio) */}
          <div className="flex items-center rounded-md border border-neutral-800 bg-neutral-950 p-0.5">
            {(['2.39', '1.85', '16:9'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => onChangeAspectRatio(ratio)}
                className={`rounded px-2 py-1 text-xs font-mono-tech transition-colors cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-neutral-800 text-amber-400 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {ratio === '16:9' ? '16:9' : `${ratio}:1`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
