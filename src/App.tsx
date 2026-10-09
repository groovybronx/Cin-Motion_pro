import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StaticCameraMovementRepository } from './infrastructure/repositories/static-camera-movement.repository.ts';
import { StaticGlossaryRepository } from './infrastructure/repositories/static-glossary.repository.ts';
import { GetCameraMovementsUseCase } from './application/use-cases/get-camera-movements.use-case.ts';
import { GetGlossaryTermsUseCase } from './application/use-cases/get-glossary-terms.use-case.ts';
import { CameraMovementDto } from './application/dtos/camera-movement.dto.ts';
import { GlossaryTermDto } from './application/dtos/glossary-term.dto.ts';
import { CustomCameraPlanEntity } from './domain/entities/custom-camera-plan.entity.ts';
import { CustomImageSceneEntity } from './domain/entities/custom-image-scene.entity.ts';
import { MovementCategory, MovementId } from './domain/entities/camera-movement.entity.ts';
import { CinematicCalculationService } from './domain/services/cinematic-calculation.service.ts';
import { Header } from './infrastructure/ui/components/Header.tsx';
import { SimulationStage } from './infrastructure/ui/components/SimulationStage.tsx';
import { TimelineController, StageViewMode } from './infrastructure/ui/components/TimelineController.tsx';
import { SidebarDrawer, SidebarTab } from './infrastructure/ui/components/SidebarDrawer.tsx';
import { GlossaryModal } from './infrastructure/ui/components/GlossaryModal.tsx';
import { BLANK_PLAN } from './infrastructure/ui/components/PlaygroundTabContent.tsx';
import { Clapperboard, PanelLeftOpen, Sliders, Image as ImageIcon } from 'lucide-react';

export default function App() {
  // Repositories & Use Cases
  const movementRepo = useMemo(() => new StaticCameraMovementRepository(), []);
  const glossaryRepo = useMemo(() => new StaticGlossaryRepository(), []);

  const getMovementsUseCase = useMemo(() => new GetCameraMovementsUseCase(movementRepo), [movementRepo]);
  const getGlossaryUseCase = useMemo(() => new GetGlossaryTermsUseCase(glossaryRepo), [glossaryRepo]);
  const calculationService = useMemo(() => new CinematicCalculationService(), []);

  // Data state
  const [movements, setMovements] = useState<readonly CameraMovementDto[]>([]);
  const [glossaryTerms, setGlossaryTerms] = useState<readonly GlossaryTermDto[]>([]);

  // Active selection state
  const [selectedId, setSelectedId] = useState<MovementId>('dolly-in');
  const [activeCategory, setActiveCategory] = useState<MovementCategory | 'all'>('all');
  const [activeCustomPlan, setActiveCustomPlan] = useState<CustomCameraPlanEntity | null>(null);
  const [customImageScene, setCustomImageScene] = useState<CustomImageSceneEntity | null>(null);

  // Sidebar & Modals state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('encyclopedia');
  const [activeGlossaryModalTerm, setActiveGlossaryModalTerm] = useState<GlossaryTermDto | null>(null);

  // Playback & Animation state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<'2.39' | '1.85' | '16:9'>('2.39');
  const [viewMode, setViewMode] = useState<StageViewMode>('split');

  // Animation frame loop refs
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Load initial data
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getMovementsUseCase.execute(),
      getGlossaryUseCase.execute(),
    ]).then(([movs, terms]) => {
      if (isMounted) {
        setMovements(movs);
        setGlossaryTerms(terms);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [getMovementsUseCase, getGlossaryUseCase]);

  // Active selected movement
  const selectedMovement = useMemo(() => {
    return movements.find((m) => m.id === selectedId) ?? movements[0] ?? null;
  }, [movements, selectedId]);

  // Silky smooth playback animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      lastTimeRef.current = null;
      return;
    }

    const duration = activeCustomPlan
      ? activeCustomPlan.durationSeconds * 1000
      : 3800;
    const cycleDurationMs = duration / speedMultiplier;

    const loop = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = time - lastTimeRef.current;
        setProgress((prev) => {
          const next = prev + delta / cycleDurationMs;
          return next >= 1 ? 0 : next;
        });
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, speedMultiplier, activeCustomPlan]);

  // Calculated simulation kinematic state
  const simulationState = useMemo(() => {
    if (activeCustomPlan) {
      return calculationService.calculateCustomPlanSimulationState(
        activeCustomPlan,
        progress,
        performance.now()
      );
    }

    return calculationService.calculateSimulationState(
      selectedId,
      progress,
      performance.now()
    );
  }, [calculationService, selectedId, progress, activeCustomPlan]);

  // Open glossary term by key
  const handleOpenGlossaryKey = useCallback(
    (key: string) => {
      const term = glossaryTerms.find((t) => t.key.toLowerCase() === key.toLowerCase());
      if (term) {
        setActiveGlossaryModalTerm(term);
      }
    },
    [glossaryTerms]
  );

  // Selection handlers
  const handleSelectMovement = useCallback((id: MovementId) => {
    setSelectedId(id);
    setActiveCustomPlan(null);
    setProgress(0);
  }, []);

  // Apply custom playground plan
  const handleApplyCustomPlan = useCallback((plan: CustomCameraPlanEntity) => {
    setActiveCustomPlan(plan);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const handleTabChange = useCallback((tab: SidebarTab) => {
    setSidebarTab(tab);
    if (tab === 'playground' && !activeCustomPlan) {
      setActiveCustomPlan(BLANK_PLAN);
      setProgress(0);
    }
  }, [activeCustomPlan]);

  if (!selectedMovement) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-950 text-neutral-400 font-mono-tech">
        Initialisation du plateau cinématographique...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0d] text-neutral-100 flex flex-col">
      {/* Top Bar Navigation (Clean branding without duplicate toggles) */}
      <Header />

      {/* Retractable Left Sidebar */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        activeTab={sidebarTab}
        movements={movements}
        selectedMovement={selectedMovement}
        activeCategory={activeCategory}
        glossaryTerms={glossaryTerms}
        activeCustomPlan={activeCustomPlan}
        activeImageScene={customImageScene}
        onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
        onChangeTab={handleTabChange}
        onSelectMovement={handleSelectMovement}
        onSelectCategory={setActiveCategory}
        onSelectGlossaryTerm={(t) => setActiveGlossaryModalTerm(t)}
        onOpenGlossaryKey={handleOpenGlossaryKey}
        onApplyCustomPlan={handleApplyCustomPlan}
        onApplyImageScene={(scene) => setCustomImageScene(scene)}
      />

      {/* Main Sandbox Stage Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:ml-[500px]' : 'ml-0'
        }`}
      >
        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
          {/* Status Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                  <span>Ouvrir la Régie</span>
                </button>
              )}

              <div className="flex flex-col">
                {customImageScene ? (
                  <>
                    <div className="flex items-center gap-2 text-xs font-mono-tech text-emerald-400">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>STUDIO PHOTO 2.5D · PROFONDEUR PARALLAXE</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-cinema font-bold text-neutral-100">
                      Parallaxe sur Image Personnalisée
                    </h1>
                  </>
                ) : activeCustomPlan ? (
                  <>
                    <div className="flex items-center gap-2 text-xs font-mono-tech text-amber-400">
                      <Sliders className="h-3.5 w-3.5" />
                      <span>PLAN SUR MESURE (PLAYGROUND) :</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-cinema font-bold text-neutral-100">
                      {activeCustomPlan.name}
                    </h1>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs font-mono-tech text-amber-400">
                      <Clapperboard className="h-3.5 w-3.5" />
                      <span>MOUVEMENT AU CATALOGUE :</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-cinema font-bold text-neutral-100">
                      {selectedMovement.frenchName}
                    </h1>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Simulation Stage */}
          <SimulationStage
            movementId={selectedId}
            state={simulationState}
            progress={progress}
            isPlaying={isPlaying}
            showGrid={showGrid}
            aspectRatio={aspectRatio}
            viewMode={viewMode}
            customImageScene={customImageScene}
          />

          {/* Timeline Controller */}
          <TimelineController
            isPlaying={isPlaying}
            progress={progress}
            speedMultiplier={speedMultiplier}
            showGrid={showGrid}
            aspectRatio={aspectRatio}
            viewMode={viewMode}
            onTogglePlay={() => setIsPlaying((prev) => !prev)}
            onScrub={(val) => setProgress(val)}
            onReset={() => setProgress(0)}
            onChangeSpeed={setSpeedMultiplier}
            onToggleGrid={() => setShowGrid((prev) => !prev)}
            onChangeAspectRatio={setAspectRatio}
            onChangeViewMode={setViewMode}
          />
        </main>
      </div>

      {/* Interactive Glossary Popup Modal */}
      <GlossaryModal
        term={activeGlossaryModalTerm}
        onClose={() => setActiveGlossaryModalTerm(null)}
      />

      {/* Footer minimaliste et épuré */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-4 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
          <span className="font-semibold text-neutral-400">© CinéMotion</span>
          <span className="font-mono-tech text-[11px] text-neutral-500">Plateau 3D & Viseur Cinématographique</span>
        </div>
      </footer>
    </div>
  );
}
