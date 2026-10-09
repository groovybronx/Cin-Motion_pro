import React from 'react';
import { Compass, Heart, AlertCircle, Wrench, Film } from 'lucide-react';
import { CameraMovementDto, EquipmentDto, FilmExampleDto } from '../../../application/dtos/camera-movement.dto.ts';
import { InteractiveTextWithGlossary } from './InteractiveTextWithGlossary.tsx';

interface MovementPedagogyPanelProps {
  readonly movement: CameraMovementDto;
  readonly onOpenGlossaryTerm?: (key: string) => void;
}

export const MovementPedagogyPanel: React.FC<MovementPedagogyPanelProps> = ({
  movement,
  onOpenGlossaryTerm = () => {},
}) => {
  return (
    <article className="flex flex-col gap-6 rounded-lg border border-neutral-800 bg-neutral-900/60 p-6 md:p-8 backdrop-blur-sm">
      {/* Title & Metadata Header (Zero-Pill discipline) */}
      <div className="flex flex-col gap-2 border-b border-neutral-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>{movement.categoryLabel}</span>
          <span aria-hidden="true">·</span>
          <span>Fiche Pédagogique Cinématographique</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tech text-amber-400">{movement.originalName}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-cinema font-bold tracking-tight text-neutral-100">
          {movement.frenchName}
        </h2>
        <p className="mt-1 text-base text-neutral-300 leading-relaxed">
          <InteractiveTextWithGlossary
            text={movement.shortDefinition}
            onOpenGlossaryTerm={onOpenGlossaryTerm}
          />
        </p>
      </div>

      {/* Grid: Mechanical Axis & Key Difference Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mechanical Axis Box */}
        <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Compass className="h-4 w-4" />
            <span>AXE MÉCANIQUE & CINÉTIQUE</span>
          </div>
          <p className="text-sm text-neutral-300 leading-snug">
            <InteractiveTextWithGlossary
              text={movement.mechanicalAxis}
              onOpenGlossaryTerm={onOpenGlossaryTerm}
            />
          </p>
        </div>

        {/* Essential distinction */}
        <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <AlertCircle className="h-4 w-4" />
            <span>DISTINCTION FONDAMENTALE</span>
          </div>
          <p className="text-sm text-neutral-300 leading-snug">
            <InteractiveTextWithGlossary
              text={movement.keyDifferences}
              onOpenGlossaryTerm={onOpenGlossaryTerm}
            />
          </p>
        </div>
      </div>

      {/* Emotional Impact & Narrative Intent */}
      <div className="flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-950/40 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
          <Heart className="h-4 w-4 text-rose-400" />
          <span>Pourquoi le réalisateur choisit ce mouvement ? (Impact Dramatique)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-300">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Effet Émotionnel sur le Spectateur
            </h4>
            <p className="leading-relaxed">
              <InteractiveTextWithGlossary
                text={movement.emotionalImpact}
                onOpenGlossaryTerm={onOpenGlossaryTerm}
              />
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Rôle Narratif & Dramaturgie
            </h4>
            <p className="leading-relaxed">
              <InteractiveTextWithGlossary
                text={movement.narrativeUsage}
                onOpenGlossaryTerm={onOpenGlossaryTerm}
              />
            </p>
          </div>
        </div>
      </div>

      {/* Equipment & Machinerie */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
          <Wrench className="h-4 w-4 text-amber-400" />
          <span>Machinerie & Équipement Plateau</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {movement.equipment.map((tool: EquipmentDto, idx: number) => (
            <div
              key={idx}
              className="flex flex-col gap-1 rounded-md border border-neutral-800/80 bg-neutral-950/60 p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300">
                  <InteractiveTextWithGlossary
                    text={tool.toolName}
                    onOpenGlossaryTerm={onOpenGlossaryTerm}
                  />
                </span>
                <span className="text-[10px] font-mono-tech uppercase text-neutral-400">
                  {tool.stabilityLevel}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-normal">
                <InteractiveTextWithGlossary
                  text={tool.roleDescription}
                  onOpenGlossaryTerm={onOpenGlossaryTerm}
                />
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Iconic Film References */}
      <div className="flex flex-col gap-4 border-t border-neutral-800/80 pt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
          <Film className="h-4 w-4 text-amber-400" />
          <span>Scènes Cultes de l'Histoire du Cinéma</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {movement.iconicExamples.map((ex: FilmExampleDto, idx: number) => (
            <div
              key={idx}
              className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 transition-colors hover:border-neutral-700"
            >
              <div className="flex items-baseline justify-between border-b border-neutral-800/50 pb-2">
                <h4 className="text-sm font-semibold text-neutral-100">
                  {ex.filmTitle}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <span>{ex.director}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tech">{ex.year}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                <span className="font-semibold text-neutral-200">Scène : </span>
                {ex.sceneDescription}
              </p>
              <p className="text-xs text-amber-300/90 italic leading-relaxed">
                "{ex.emotionalReason}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};


