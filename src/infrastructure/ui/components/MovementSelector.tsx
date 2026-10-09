import React from 'react';
import { MovementCategory, MovementId } from '../../../domain/entities/camera-movement.entity.ts';
import { CameraMovementDto } from '../../../application/dtos/camera-movement.dto.ts';

interface MovementSelectorProps {
  readonly movements: readonly CameraMovementDto[];
  readonly selectedId: MovementId;
  readonly activeCategory: MovementCategory | 'all';
  readonly onSelectMovement: (id: MovementId) => void;
  readonly onSelectCategory: (category: MovementCategory | 'all') => void;
}

export const MovementSelector: React.FC<MovementSelectorProps> = ({
  movements,
  selectedId,
  activeCategory,
  onSelectMovement,
  onSelectCategory,
}) => {
  const filteredMovements =
    activeCategory === 'all'
      ? movements
      : movements.filter((m) => m.category === activeCategory);

  const categories: readonly { readonly id: MovementCategory | 'all'; readonly label: string }[] = [
    { id: 'all', label: 'Tous les Mouvements' },
    { id: 'axis', label: 'Sur Axe Fixe' },
    { id: 'physical', label: 'Déplacements Physiques' },
    { id: 'optical', label: 'Optiques & Hybrides' },
    { id: 'organic', label: 'Organiques' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Category selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-sm'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Movement Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filteredMovements.map((movement) => {
          const isSelected = movement.id === selectedId;
          return (
            <button
              key={movement.id}
              type="button"
              onClick={() => onSelectMovement(movement.id)}
              className={`group flex flex-col items-start rounded-lg p-3 text-left transition-all cursor-pointer border ${
                isSelected
                  ? 'border-amber-500/60 bg-gradient-to-b from-amber-500/10 to-transparent shadow-lg shadow-amber-500/5'
                  : 'border-neutral-800/80 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    isSelected ? 'text-amber-400' : 'text-neutral-200 group-hover:text-white'
                  }`}
                >
                  {movement.frenchName}
                </span>
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
              </div>
              <span className="mt-1 text-[11px] font-mono-tech text-neutral-400">
                {movement.originalName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
