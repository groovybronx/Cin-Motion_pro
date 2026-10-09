import React, { useState } from 'react';
import { Film, BookOpen, Compass, Search, ChevronRight, Sliders, Camera, Layers, Grid, ArrowRightLeft } from 'lucide-react';
import { CameraMovementDto } from '../../../application/dtos/camera-movement.dto.ts';
import { GlossaryTermDto } from '../../../application/dtos/glossary-term.dto.ts';
import { MovementCategory, MovementId } from '../../../domain/entities/camera-movement.entity.ts';
import { MovementSelector } from './MovementSelector.tsx';
import { MovementPedagogyPanel } from './MovementPedagogyPanel.tsx';

export type EncyclopediaSection = 'movements' | 'glossary' | 'rules';

interface EncyclopediaTabContentProps {
  readonly movements: readonly CameraMovementDto[];
  readonly selectedMovement: CameraMovementDto;
  readonly activeCategory: MovementCategory | 'all';
  readonly glossaryTerms: readonly GlossaryTermDto[];
  readonly onSelectMovement: (id: MovementId) => void;
  readonly onSelectCategory: (category: MovementCategory | 'all') => void;
  readonly onSelectGlossaryTerm: (term: GlossaryTermDto) => void;
  readonly onOpenGlossaryKey: (key: string) => void;
}

export const EncyclopediaTabContent: React.FC<EncyclopediaTabContentProps> = ({
  movements,
  selectedMovement,
  activeCategory,
  glossaryTerms,
  onSelectMovement,
  onSelectCategory,
  onSelectGlossaryTerm,
  onOpenGlossaryKey,
}) => {
  const [activeSection, setActiveSection] = useState<EncyclopediaSection>('movements');
  const [glossarySearch, setGlossarySearch] = useState<string>('');
  const [selectedGlossaryCategory, setSelectedGlossaryCategory] = useState<string>('all');

  // Filtered glossary terms
  const filteredGlossary = glossaryTerms.filter((term) => {
    const matchesSearch =
      term.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      term.definition.toLowerCase().includes(glossarySearch.toLowerCase());
    const matchesCategory =
      selectedGlossaryCategory === 'all' || term.category === selectedGlossaryCategory;
    return matchesSearch && matchesCategory;
  });

  const glossaryCategories = [
    { id: 'all', label: 'Tous' },
    { id: 'optique', label: 'Optique' },
    { id: 'machinerie', label: 'Machinerie' },
    { id: 'cadrage', label: 'Cadrage' },
    { id: 'mise-en-scene', label: 'Mise en scène' },
  ];

  const cinematographyRules = [
    {
      title: 'Règle des 180° (Axe d’action)',
      category: 'Géométrie spatiale',
      description:
        'Ligne imaginaire reliant deux personnages en dialogue. La caméra doit impérativement rester du même côté de cette ligne pour préserver la cohérence des regards et éviter de désorienter le spectateur.',
      keyTerm: 'regle-180',
      icon: Compass,
    },
    {
      title: 'Travelling vs Zoom (Parallaxe 3D)',
      category: 'Optique vs Déplacement',
      description:
        'Le travelling déplace physiquement l’objectif dans l’espace réel et modifie les rapports de taille entre plans (parallaxe). Le zoom est un grossissement optique statique qui compresse et aplatit les plans.',
      keyTerm: 'parallaxe',
      icon: Sliders,
    },
    {
      title: 'Règle des 30° (Changement d’axe)',
      category: 'Continuité de montage',
      description:
        'Pour enchaîner deux valeurs de plan successives d’un même sujet sans produire un saut d’image désagréable (jump cut), la caméra doit varier son axe d’au moins 30° ou changer nettement de focale.',
      keyTerm: 'axe',
      icon: Camera,
    },
    {
      title: 'Obturateur & Règle des 180° temporel',
      category: 'Flou de mouvement (Motion Blur)',
      description:
        'À 24 images par seconde, l’obturateur ouvert à 180° correspond à un temps d’exposition de 1/48s. Cela produit le flou de mouvement cinématique naturel auquel l’œil humain est habitué au cinéma.',
      keyTerm: 'focale',
      icon: Layers,
    },
    {
      title: 'Règle des Tiers & Lignes de Force',
      category: 'Composition & Cadrage',
      description:
        'Divise l’écran en neuf rectangles égaux avec deux lignes horizontales et deux lignes verticales. Placer les regards ou points d’intérêt aux intersections crée un équilibre dynamique et naturel.',
      keyTerm: 'plongee',
      icon: Grid,
    },
    {
      title: 'Raccord dans l’axe & Sens du Regard',
      category: 'Raccord & Narration',
      description:
        'Le respect de la direction des déplacements (gauche vers droite) et des lignes de regard entre champs et contrechamps garantit la fluidité narrative et l’immersion sans rupture.',
      keyTerm: 'champ-contrechamp',
      icon: ArrowRightLeft,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-Navigation: 3 Pillars of Cinematographic Knowledge */}
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-1">
        <button
          type="button"
          onClick={() => setActiveSection('movements')}
          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'movements'
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Film className="h-3.5 w-3.5" />
          <span>Mouvements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('glossary')}
          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'glossary'
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Glossaire</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('rules')}
          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'rules'
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Règles de l'Art</span>
        </button>
      </div>

      {/* SECTION 1: MOVEMENTS CATALOG & DETAILED TECHNICAL SHEET */}
      {activeSection === 'movements' && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono-tech uppercase tracking-wider text-amber-400">
              Sélecteur de Mouvements
            </span>
            <MovementSelector
              movements={movements}
              selectedId={selectedMovement.id}
              activeCategory={activeCategory}
              onSelectMovement={onSelectMovement}
              onSelectCategory={onSelectCategory}
            />
          </div>

          <MovementPedagogyPanel
            movement={selectedMovement}
            onOpenGlossaryTerm={onOpenGlossaryKey}
          />
        </div>
      )}

      {/* SECTION 2: GLOSSARY SEARCH & DEFINITIONS */}
      {activeSection === 'glossary' && (
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              value={glossarySearch}
              onChange={(e) => setGlossarySearch(e.target.value)}
              placeholder="Rechercher un terme (ex: parallaxe, dolly, focale...)"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {glossaryCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedGlossaryCategory(cat.id)}
                className={`whitespace-nowrap shrink-0 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedGlossaryCategory === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Terms List */}
          <div className="flex flex-col gap-2">
            {filteredGlossary.map((term) => (
              <button
                key={term.key}
                type="button"
                onClick={() => onSelectGlossaryTerm(term)}
                className="group flex flex-col gap-1.5 rounded-lg border border-neutral-800/80 bg-neutral-950/70 p-3.5 text-left transition-all hover:border-amber-500/40 hover:bg-neutral-900/90 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-amber-400 opacity-90" />
                    <span className="text-xs font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors">
                      {term.term}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <span>{term.categoryLabel}</span>
                    <ChevronRight className="h-3 w-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <p className="line-clamp-2 text-xs text-neutral-400 leading-relaxed">
                  {term.definition}
                </p>
              </button>
            ))}

            {filteredGlossary.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-500">
                Aucun terme trouvé pour « {glossarySearch} ».
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: RULES OF ART & CINEMATOGRAPHY LAWS */}
      {activeSection === 'rules' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b border-neutral-800 pb-3">
            <span className="text-[11px] font-mono-tech uppercase tracking-wider text-amber-400">
              Grammaire du Réalisateur
            </span>
            <h3 className="font-cinema text-lg font-bold text-neutral-100">
              Les Règles Fondamentales de l'Art
            </h3>
            <p className="text-xs text-neutral-400">
              Les principes et conventions qui régissent la grammaire cinématographique sur un tournage.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {cinematographyRules.map((rule, idx) => {
              const Icon = rule.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 transition-colors hover:border-neutral-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-500/10 text-amber-400">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-xs font-semibold text-neutral-100">{rule.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono-tech text-amber-400/80">
                      {rule.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {rule.description}
                  </p>
                  {rule.keyTerm && (
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => onOpenGlossaryKey(rule.keyTerm)}
                        className="text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Voir la fiche technique</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
