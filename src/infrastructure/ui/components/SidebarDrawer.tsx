import React from 'react';
import {
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { CameraMovementDto } from '../../../application/dtos/camera-movement.dto.ts';
import { GlossaryTermDto } from '../../../application/dtos/glossary-term.dto.ts';
import { CustomCameraPlanEntity } from '../../../domain/entities/custom-camera-plan.entity.ts';
import { CustomImageSceneEntity } from '../../../domain/entities/custom-image-scene.entity.ts';
import { MovementCategory, MovementId } from '../../../domain/entities/camera-movement.entity.ts';
import { EncyclopediaTabContent } from './EncyclopediaTabContent.tsx';
import { PlaygroundTabContent } from './PlaygroundTabContent.tsx';
import { ImageDepthStudioTab } from './ImageDepthStudioTab.tsx';

export type SidebarTab = 'encyclopedia' | 'playground' | 'image-depth';

interface SidebarDrawerProps {
  readonly isOpen: boolean;
  readonly activeTab: SidebarTab;
  readonly movements: readonly CameraMovementDto[];
  readonly selectedMovement: CameraMovementDto;
  readonly activeCategory: MovementCategory | 'all';
  readonly glossaryTerms: readonly GlossaryTermDto[];
  readonly activeCustomPlan: CustomCameraPlanEntity | null;
  readonly activeImageScene: CustomImageSceneEntity | null;
  readonly onToggleOpen: () => void;
  readonly onChangeTab: (tab: SidebarTab) => void;
  readonly onSelectMovement: (id: MovementId) => void;
  readonly onSelectCategory: (category: MovementCategory | 'all') => void;
  readonly onSelectGlossaryTerm: (term: GlossaryTermDto) => void;
  readonly onOpenGlossaryKey: (key: string) => void;
  readonly onApplyCustomPlan: (plan: CustomCameraPlanEntity) => void;
  readonly onApplyImageScene: (scene: CustomImageSceneEntity | null) => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  activeTab,
  movements,
  selectedMovement,
  activeCategory,
  glossaryTerms,
  activeCustomPlan,
  activeImageScene,
  onToggleOpen,
  onChangeTab,
  onSelectMovement,
  onSelectCategory,
  onSelectGlossaryTerm,
  onOpenGlossaryKey,
  onApplyCustomPlan,
  onApplyImageScene,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Floating Re-open Button attached to left edge when Sidebar is folded */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggleOpen}
          title="Ouvrir la régie latérale"
          className="fixed top-20 left-0 z-30 flex items-center gap-2 rounded-r-lg border border-l-0 border-amber-500/40 bg-neutral-900/95 px-3 py-2 text-xs font-semibold text-amber-400 shadow-xl backdrop-blur-md hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <PanelLeftOpen className="h-4 w-4" />
          <span className="font-cinema text-[11px] tracking-wider">RÉGIE</span>
        </button>
      )}

      {/* Drawer Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex flex-col border-r border-neutral-800 bg-[#0c0d12]/95 backdrop-blur-xl transition-all duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'w-full sm:w-[500px] translate-x-0' : '-translate-x-full w-0'
        }`}
      >
        {/* Drawer Header with 3 Core Studio Tabs */}
        <div className="flex flex-col border-b border-neutral-800 bg-neutral-950 p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="font-cinema text-xs font-bold uppercase tracking-wider text-amber-400">
              Régie Pédagogique & Studio Cinéma
            </span>
            <button
              type="button"
              onClick={onToggleOpen}
              title="Replier le panneau latéral"
              className="rounded p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* 3 Core Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-neutral-800 bg-neutral-900/90 p-1">
            <button
              type="button"
              onClick={() => onChangeTab('encyclopedia')}
              className={`flex items-center justify-center gap-2 rounded py-2 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'encyclopedia'
                  ? 'bg-neutral-800 text-amber-300 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Encyclopédie</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('playground')}
              className={`flex items-center justify-center gap-2 rounded py-2 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'playground'
                  ? 'bg-neutral-800 text-amber-300 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Créer un Plan</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('image-depth')}
              className={`flex items-center justify-center gap-2 rounded py-2 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'image-depth'
                  ? 'bg-neutral-800 text-amber-300 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Studio 2.5D</span>
            </button>
          </div>
        </div>

        {/* Scrollable Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {activeTab === 'encyclopedia' && (
            <EncyclopediaTabContent
              movements={movements}
              selectedMovement={selectedMovement}
              activeCategory={activeCategory}
              glossaryTerms={glossaryTerms}
              onSelectMovement={onSelectMovement}
              onSelectCategory={onSelectCategory}
              onSelectGlossaryTerm={onSelectGlossaryTerm}
              onOpenGlossaryKey={onOpenGlossaryKey}
            />
          )}

          {activeTab === 'playground' && (
            <PlaygroundTabContent
              activeCustomPlan={activeCustomPlan}
              onApplyPlan={onApplyCustomPlan}
            />
          )}

          {activeTab === 'image-depth' && (
            <ImageDepthStudioTab
              activeImageScene={activeImageScene}
              onApplyImageScene={onApplyImageScene}
              onSelectMovement={onSelectMovement}
            />
          )}
        </div>
      </aside>
    </>
  );
};
