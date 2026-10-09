import React from 'react';
import { X, BookOpen, Lightbulb, Film, Compass } from 'lucide-react';
import { GlossaryTermDto } from '../../../application/dtos/glossary-term.dto.ts';

interface GlossaryModalProps {
  readonly term: GlossaryTermDto | null;
  readonly onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ term, onClose }) => {
  if (!term) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-amber-400">
              <BookOpen className="h-3.5 w-3.5" />
              <span>GLOSSAIRE TECHNIQUE · {term.categoryLabel.toUpperCase()}</span>
            </div>
            <h3 className="font-cinema text-xl font-bold text-neutral-100">
              {term.term}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 flex flex-col gap-4">
          {/* Definition */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Définition Cinématographique
            </span>
            <p className="text-sm text-neutral-200 leading-relaxed bg-neutral-950/60 p-3.5 rounded-lg border border-neutral-800/80">
              {term.definition}
            </p>
          </div>

          {/* Concrete example */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Film className="h-3.5 w-3.5" />
              <span>Exemple Concret au Cinéma</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/60 italic">
              "{term.concreteExample}"
            </p>
          </div>

          {/* Technical tip */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>Astuce de Tournage & Erreur à Éviter</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed bg-sky-950/20 p-3 rounded-lg border border-sky-900/30">
              {term.technicalTip}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-neutral-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Fermer la définition
          </button>
        </div>
      </div>
    </div>
  );
};
