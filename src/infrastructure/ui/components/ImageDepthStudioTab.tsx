import React, { useState, useMemo } from 'react';
import {
  Upload,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Scan,
  Eye,
  EyeOff,
  Layers,
  Film,
  Camera,
  AlertTriangle,
} from 'lucide-react';
import {
  CustomImageSceneEntity,
  ImageSceneLayer,
} from '../../../domain/entities/custom-image-scene.entity.ts';
import { MovementId } from '../../../domain/entities/camera-movement.entity.ts';
import { AnalyzeImageSceneUseCase } from '../../../application/use-cases/analyze-image-scene.use-case.ts';

interface ImageDepthStudioTabProps {
  readonly activeImageScene: CustomImageSceneEntity | null;
  readonly onApplyImageScene: (scene: CustomImageSceneEntity | null) => void;
  readonly onSelectMovement?: (movementId: MovementId) => void;
}

export const ImageDepthStudioTab: React.FC<ImageDepthStudioTabProps> = ({
  activeImageScene,
  onApplyImageScene,
  onSelectMovement,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const analyzeUseCase = useMemo(() => new AnalyzeImageSceneUseCase(), []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Format de fichier non pris en charge. Veuillez importer une image valide.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await runGeminiAnalysis(dataUrl);
      }
    };
    reader.onerror = () => {
      setErrorMessage("Échec de lecture du fichier image.");
    };
    reader.readAsDataURL(file);
  };

  const runGeminiAnalysis = async (dataUrl: string): Promise<void> => {
    try {
      setIsAnalyzing(true);
      setErrorMessage(null);

      // Étape 1 : Analyse multimodale de scène (Gemini Flash)
      setAnalysisStep('Étape 1 : Analyse multimodale de scène & étagement des plans (Gemini Flash)...');
      await new Promise((resolve) => setTimeout(resolve, 350));

      // Étape 2 : Édition & génération des plaques (Clean plate inpainting & détourage)
      setAnalysisStep('Étape 2 : Génération des calques VFX & instructions d’inpainting ciblées...');
      const scene = await analyzeUseCase.execute(dataUrl);

      // Étape 3 : Post-traitement local de transparence alpha
      setAnalysisStep('Étape 3 : Conversion du fond uni en canal alpha transparent (PNG feathering)...');
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Étape 4 : Rendu interactif 2.5D prêt
      setAnalysisStep('Étape 4 : Empilement CSS/Canvas & calibration de parallaxe interactive...');
      await new Promise((resolve) => setTimeout(resolve, 200));

      onApplyImageScene(scene);
      setAnalysisStep('');
    } catch (err) {
      console.error('Erreur pipeline parallaxe 2.5D:', err);
      const msg = err instanceof Error ? err.message : 'Erreur inconnue lors du pipeline';
      setErrorMessage(msg);
      setAnalysisStep('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetToStudio = (): void => {
    onApplyImageScene(null);
    setErrorMessage(null);
    setAnalysisStep('');
  };

  const handleUpdateLayer = (
    layerId: string,
    updates: Partial<Omit<ImageSceneLayer, 'id'>>
  ): void => {
    if (!activeImageScene) return;

    const updatedLayers = activeImageScene.layers.map((l) =>
      l.id === layerId ? ({ ...l, ...updates } as ImageSceneLayer) : l
    );

    onApplyImageScene({
      ...activeImageScene,
      layers: updatedLayers,
    });
  };

  const handleApplyRecommendedMovement = (): void => {
    if (activeImageScene?.recommendedMovementId && onSelectMovement) {
      onSelectMovement(activeImageScene.recommendedMovementId as MovementId);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Intro Header */}
      <div className="flex flex-col gap-1.5 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono-tech text-amber-400">
          <Sparkles className="h-4 w-4" />
          <span>PIPELINE DE PARALLAXE 2.5D · GEMINI IA</span>
        </div>
        <h4 className="font-cinema text-sm font-bold text-neutral-100">
          Décomposition Automatisée en Calques de Profondeur
        </h4>
      </div>

      {/* Upload Zone */}
      <div className="flex flex-col gap-3">
        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-800 bg-neutral-950 p-6 hover:border-amber-500/50 hover:bg-neutral-900/60 transition-all cursor-pointer">
          <Upload className="h-7 w-7 text-amber-400" />
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-neutral-200">
              Déposez votre photo ou cliquez pour parcourir
            </span>
            <span className="text-[10px] text-neutral-400 mt-1">
              Portraits, plans de cinéma, photos de plateau (JPEG, PNG, WebP)
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isAnalyzing}
            className="hidden"
          />
        </label>
      </div>

      {/* Analysis Error Notification */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-red-200">Échec du pipeline 2.5D</span>
            <p className="text-[11px] leading-relaxed text-red-300/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Live AI Analysis Progress */}
      {isAnalyzing && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 animate-spin text-amber-400" />
            <span className="font-semibold">Pipeline VFX 2.5D en cours...</span>
          </div>
          <p className="text-[11px] text-amber-200/90 font-mono-tech animate-pulse">
            {analysisStep}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
            <div className="h-full w-2/3 animate-pulse bg-gradient-to-r from-amber-500 to-amber-300" />
          </div>
        </div>
      )}

      {/* Active Scene Entity Breakdown */}
      {activeImageScene && !isAnalyzing && (
        <div className="flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Pipeline 2.5D Réussi {activeImageScene.usedModel ? `(${activeImageScene.usedModel})` : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetToStudio}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Changer d'image</span>
            </button>
          </div>

          {/* AI Cinematic Diagnosis Card */}
          <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono-tech text-[10px] uppercase text-amber-400">
                Composition : {activeImageScene.compositionType}
              </span>
              {activeImageScene.recommendedMovementId && (
                <button
                  type="button"
                  onClick={handleApplyRecommendedMovement}
                  className="flex items-center gap-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-1 text-[11px] font-semibold border border-amber-500/30 transition-colors cursor-pointer"
                >
                  <Film className="h-3 w-3 text-amber-400" />
                  <span>Tester : {activeImageScene.recommendedMovementId}</span>
                </button>
              )}
            </div>

            <p className="text-neutral-300 text-[11px] leading-relaxed italic">
              "{activeImageScene.sceneDescription}"
            </p>

            {activeImageScene.cinematicAdvice && (
              <div className="flex items-start gap-1.5 text-[11px] text-neutral-400 border-t border-neutral-800/80 pt-2">
                <Camera className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Conseil VFX & Caméra :</strong> {activeImageScene.cinematicAdvice}
                </span>
              </div>
            )}
          </div>

          {/* Visual Plates Inspector */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase text-neutral-400">
              Plaques & Calques Découpés ({activeImageScene.layers.length}) :
            </span>

            <div className="grid grid-cols-2 gap-2">
              {activeImageScene.layers.map((layer) => {
                const isBg = layer.role === 'background' || layer.zIndex === 1;
                return (
                  <div
                    key={layer.id}
                    className="flex flex-col gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/50 p-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono-tech font-bold text-neutral-300">
                        z-{layer.zIndex} : {layer.label}
                      </span>
                      <span className="text-[9px] font-mono-tech text-amber-400">
                        {layer.depthFactor}x
                      </span>
                    </div>

                    <div className="relative aspect-video w-full overflow-hidden rounded bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:8px_8px] border border-neutral-800/80 flex items-center justify-center">
                      <img
                        src={layer.dataUrl}
                        alt={layer.label}
                        className={`h-full w-full ${isBg ? 'object-cover' : 'object-contain'}`}
                      />
                    </div>

                    {layer.editPrompt && (
                      <span
                        className="text-[9px] text-neutral-500 line-clamp-1 italic"
                        title={layer.editPrompt}
                      >
                        {layer.editPrompt}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calques VFX Étagés avec réglages fins */}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase text-neutral-400">
                Gestion des Calques VFX :
              </span>
              <span className="font-mono-tech text-[10px] text-neutral-500">
                Empilement & Parallaxe
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {activeImageScene.layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                const isBg = layer.role === 'background' || layer.zIndex === 1;
                const roleBadge = isBg
                  ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800';

                return (
                  <div
                    key={layer.id}
                    className={`flex flex-col gap-2 rounded-lg border p-2.5 text-xs transition-colors ${
                      isSelected
                        ? 'border-amber-500 bg-neutral-900'
                        : 'border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] font-mono-tech uppercase ${roleBadge}`}
                        >
                          z-{layer.zIndex} · {layer.role}
                        </span>
                        <span className="font-semibold text-neutral-200">{layer.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateLayer(layer.id, { isVisible: !layer.isVisible })
                          }
                          title={layer.isVisible ? 'Masquer ce calque' : 'Afficher ce calque'}
                          className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {layer.isVisible ? (
                            <Eye className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5 text-neutral-600" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedLayerId(isSelected ? null : layer.id)
                          }
                          className="text-[11px] font-mono-tech text-amber-400 hover:underline cursor-pointer"
                        >
                          {isSelected ? 'Fermer' : 'Ajuster'}
                        </button>
                      </div>
                    </div>

                    {/* Fine Tuning Sliders if Selected */}
                    {isSelected && (
                      <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-800/80">
                        {/* Parallax Factor */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] text-neutral-400">
                            <span>Facteur de déplacement (depthFactor) :</span>
                            <span className="font-mono-tech text-white">
                              {layer.depthFactor.toFixed(2)}x
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.05"
                            max="2.0"
                            step="0.05"
                            value={layer.depthFactor}
                            onChange={(e) =>
                              handleUpdateLayer(layer.id, {
                                depthFactor: parseFloat(e.target.value),
                              })
                            }
                            className="accent-amber-500 h-1 bg-neutral-800 rounded cursor-pointer"
                          />
                        </div>

                        {/* Blur Px */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] text-neutral-400">
                            <span>Flou de profondeur :</span>
                            <span className="font-mono-tech text-white">{layer.blurPx} px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="8"
                            step="0.5"
                            value={layer.blurPx}
                            onChange={(e) =>
                              handleUpdateLayer(layer.id, { blurPx: parseFloat(e.target.value) })
                            }
                            className="accent-amber-500 h-1 bg-neutral-800 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Info Notice */}
          <div className="rounded bg-emerald-950/30 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 leading-snug">
            ✨ <strong>Rendu 2.5D actif :</strong> Déplacez votre curseur sur le viseur (ou inclinez votre smartphone) pour observer la parallaxe en direct, ou lancez un mouvement de caméra cinématographique (Travelling, Dolly, Pan) !
          </div>
        </div>
      )}
    </div>
  );
};
