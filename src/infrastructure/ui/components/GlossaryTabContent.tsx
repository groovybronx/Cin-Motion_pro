import React, { useState } from 'react';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import { GlossaryTermDto } from '../../../application/dtos/glossary-term.dto.ts';

interface GlossaryTabContentProps {
  readonly terms: readonly GlossaryTermDto[];
  readonly onSelectTerm: (term: GlossaryTermDto) => void;
}

export const GlossaryTabContent: React.FC<GlossaryTabContentProps> = ({
  terms,
  onSelectTerm,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = terms.filter((term) => {
    const matchesSearch =
      term.term.toLowerCase().includes(search.toLowerCase()) ||
      term.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'optique', label: 'Optique' },
    { id: 'machinerie', label: 'Machinerie' },
    { id: 'cadrage', label: 'Cadrage' },
    { id: 'mise-en-scene', label: 'Mise en scène' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un terme (ex: parallaxe, dolly, focale...)"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap shrink-0 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Terms list */}
      <div className="flex flex-col gap-2">
        {filtered.map((term) => (
          <button
            key={term.key}
            type="button"
            onClick={() => onSelectTerm(term)}
            className="group flex flex-col gap-1 rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-3 text-left transition-all hover:border-amber-500/40 hover:bg-neutral-900 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-amber-400 opacity-80" />
                <span className="text-xs font-semibold text-neutral-100 group-hover:text-amber-300">
                  {term.term}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                <span>{term.categoryLabel}</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </div>
            </div>
            <p className="line-clamp-2 text-[11px] text-neutral-400 leading-snug">
              {term.definition}
            </p>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-neutral-500">
            Aucun terme trouvé pour cette recherche.
          </div>
        )}
      </div>
    </div>
  );
};
