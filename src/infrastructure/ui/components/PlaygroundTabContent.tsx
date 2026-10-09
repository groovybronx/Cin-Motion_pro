import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Sliders,
  Copy,
  Check,
  Plus,
  ChevronDown,
} from 'lucide-react';
import {
  CustomCameraPlanEntity,
  CameraKeyframeConfig,
  EasingType,
} from '../../../domain/entities/custom-camera-plan.entity.ts';

interface PlaygroundTabContentProps {
  readonly activeCustomPlan: CustomCameraPlanEntity | null;
  readonly onApplyPlan: (plan: CustomCameraPlanEntity) => void;
}

export const BLANK_PLAN: CustomCameraPlanEntity = {
  id: 'blank-plan',
  name: 'Nouveau Plan (Vierge)',
  description: 'Plan vierge neutre : réglez la machinerie, la focale et la trajectoire de la caméra pour composer votre plan.',
  durationSeconds: 3.5,
  easing: 'easeInOut',
  rigType: 'dolly',
  startKeyframe: {
    panDeg: 0,
    tiltDeg: 0,
    rollDeg: 0,
    dollyZ: 0,
    truckX: 0,
    boomY: 0,
    focalMm: 35,
    shakeIntensity: 0,
  },
  endKeyframe: {
    panDeg: 0,
    tiltDeg: 0,
    rollDeg: 0,
    dollyZ: 0,
    truckX: 0,
    boomY: 0,
    focalMm: 35,
    shakeIntensity: 0,
  },
};

const DEFAULT_PRESETS: readonly CustomCameraPlanEntity[] = [
  {
    id: 'preset-1',
    name: 'Travelling Contre-Plongée Héroïque',
    description: 'Avancée rapide vers le sujet avec inclinaison ascendante et grand angle.',
    durationSeconds: 3.5,
    easing: 'easeInOut',
    rigType: 'dolly',
    startKeyframe: {
      panDeg: 0,
      tiltDeg: -15,
      rollDeg: 0,
      dollyZ: -80,
      truckX: 0,
      boomY: -40,
      focalMm: 24,
      shakeIntensity: 0,
    },
    endKeyframe: {
      panDeg: 0,
      tiltDeg: 25,
      rollDeg: 0,
      dollyZ: 110,
      truckX: 0,
      boomY: -10,
      focalMm: 24,
      shakeIntensity: 0,
    },
  },
  {
    id: 'preset-2',
    name: 'Crash Zoom Western & Débullé',
    description: 'Resserrement violent de focale combiné à une bascule oblique anxiogène.',
    durationSeconds: 2.0,
    easing: 'dramatic',
    rigType: 'tripod',
    startKeyframe: {
      panDeg: -10,
      tiltDeg: 0,
      rollDeg: 0,
      dollyZ: 0,
      truckX: 0,
      boomY: 0,
      focalMm: 28,
      shakeIntensity: 0,
    },
    endKeyframe: {
      panDeg: 0,
      tiltDeg: 0,
      rollDeg: -18,
      dollyZ: 0,
      truckX: 0,
      boomY: 0,
      focalMm: 115,
      shakeIntensity: 0.1,
    },
  },
  {
    id: 'preset-3',
    name: 'Poursuite immersive Épaule (Guerilla)',
    description: 'Caméra portée en mouvement latéral frénétique avec fortes micro-secousses.',
    durationSeconds: 4.0,
    easing: 'linear',
    rigType: 'handheld',
    startKeyframe: {
      panDeg: -15,
      tiltDeg: -5,
      rollDeg: 4,
      dollyZ: 0,
      truckX: -120,
      boomY: 0,
      focalMm: 35,
      shakeIntensity: 0.85,
    },
    endKeyframe: {
      panDeg: 15,
      tiltDeg: 5,
      rollDeg: -4,
      dollyZ: 40,
      truckX: 120,
      boomY: 10,
      focalMm: 35,
      shakeIntensity: 0.95,
    },
  },
  {
    id: 'preset-4',
    name: 'Élévation Majestueuse Technocrane',
    description: 'La grue s’élève du sol vers le ciel en découvrant l’horizon panoramique.',
    durationSeconds: 5.0,
    easing: 'easeInOut',
    rigType: 'crane',
    startKeyframe: {
      panDeg: 0,
      tiltDeg: 0,
      rollDeg: 0,
      dollyZ: -20,
      truckX: 0,
      boomY: -60,
      focalMm: 35,
      shakeIntensity: 0,
    },
    endKeyframe: {
      panDeg: 20,
      tiltDeg: -25,
      rollDeg: 0,
      dollyZ: 50,
      truckX: 0,
      boomY: 100,
      focalMm: 50,
      shakeIntensity: 0,
    },
  },
];

export const PlaygroundTabContent: React.FC<PlaygroundTabContentProps> = ({
  activeCustomPlan,
  onApplyPlan,
}) => {
  // Starts by default with BLANK_PLAN as requested by user
  const [plans, setPlans] = useState<readonly CustomCameraPlanEntity[]>([
    BLANK_PLAN,
    ...DEFAULT_PRESETS,
  ]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    activeCustomPlan ? activeCustomPlan.id : BLANK_PLAN.id
  );

  // Editable working copy
  const currentPlan =
    plans.find((p) => p.id === selectedPlanId) ?? activeCustomPlan ?? BLANK_PLAN;

  const [name, setName] = useState<string>(currentPlan.name);
  const [description, setDescription] = useState<string>(currentPlan.description);
  const [durationSeconds, setDurationSeconds] = useState<number>(currentPlan.durationSeconds);
  const [easing, setEasing] = useState<EasingType>(currentPlan.easing);
  const [rigType, setRigType] = useState<CustomCameraPlanEntity['rigType']>(currentPlan.rigType);

  const [startKeyframe, setStartKeyframe] = useState<CameraKeyframeConfig>(
    currentPlan.startKeyframe
  );
  const [endKeyframe, setEndKeyframe] = useState<CameraKeyframeConfig>(
    currentPlan.endKeyframe
  );

  const [copied, setCopied] = useState<boolean>(false);

  // When mounting, if no activeCustomPlan is applied yet, automatically apply the blank plan
  useEffect(() => {
    if (!activeCustomPlan) {
      onApplyPlan(BLANK_PLAN);
    }
  }, [activeCustomPlan, onApplyPlan]);

  const handleSelectPreset = (plan: CustomCameraPlanEntity): void => {
    setSelectedPlanId(plan.id);
    setName(plan.name);
    setDescription(plan.description);
    setDurationSeconds(plan.durationSeconds);
    setEasing(plan.easing);
    setRigType(plan.rigType);
    setStartKeyframe(plan.startKeyframe);
    setEndKeyframe(plan.endKeyframe);
    onApplyPlan(plan);
  };

  const handleResetToBlank = (): void => {
    const newBlankId = `custom-blank-${Date.now()}`;
    const freshBlank: CustomCameraPlanEntity = {
      ...BLANK_PLAN,
      id: newBlankId,
      name: 'Nouveau Plan Vierge',
    };
    setPlans((prev) => [freshBlank, ...prev.filter((p) => p.id !== 'blank-plan')]);
    handleSelectPreset(freshBlank);
  };

  const handleApplyCurrentPlan = (): void => {
    const updated: CustomCameraPlanEntity = {
      id: selectedPlanId,
      name,
      description,
      durationSeconds,
      easing,
      rigType,
      startKeyframe,
      endKeyframe,
    };

    setPlans((prev) =>
      prev.map((p) => (p.id === selectedPlanId ? updated : p))
    );
    onApplyPlan(updated);
  };

  const handleCopySpecs = (): void => {
    const text = `Plan : ${name}\nMachinerie : ${rigType.toUpperCase()}\nDurée : ${durationSeconds}s | Courbe : ${easing}\nPoint A : Focale ${startKeyframe.focalMm}mm, Pan ${startKeyframe.panDeg}°, Tilt ${startKeyframe.tiltDeg}°, DollyZ ${startKeyframe.dollyZ}\nPoint B : Focale ${endKeyframe.focalMm}mm, Pan ${endKeyframe.panDeg}°, Tilt ${endKeyframe.tiltDeg}°, DollyZ ${endKeyframe.dollyZ}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Grouped Presets in Dropdown Menu as requested */}
      <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <label htmlFor="plan-select-dropdown" className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Modèles & Plans Prédéfinis
          </label>
          <button
            type="button"
            onClick={handleResetToBlank}
            className="flex items-center gap-1 rounded bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:border-amber-500/50 transition-colors cursor-pointer"
            title="Créer un nouveau plan vierge"
          >
            <Plus className="h-3 w-3" />
            <span>Nouveau Plan Vide</span>
          </button>
        </div>

        <div className="relative mt-1">
          <select
            id="plan-select-dropdown"
            value={selectedPlanId}
            onChange={(e) => {
              const selected = plans.find((p) => p.id === e.target.value);
              if (selected) {
                handleSelectPreset(selected);
              }
            }}
            className="w-full appearance-none rounded-lg border border-neutral-700 bg-neutral-900/90 py-2.5 pl-3 pr-10 text-xs font-medium text-neutral-100 shadow-inner focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            <optgroup label="Plan Neutre">
              <option value={BLANK_PLAN.id}>
                📄 Plan Vierge Initial (À composer)
              </option>
            </optgroup>

            <optgroup label="Modèles Cinéma Prédéfinis">
              {DEFAULT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  🎬 {preset.name} ({preset.rigType.toUpperCase()} · {preset.durationSeconds}s)
                </option>
              ))}
            </optgroup>

            {plans.filter((p) => p.id !== BLANK_PLAN.id && !DEFAULT_PRESETS.some((dp) => dp.id === p.id)).length > 0 && (
              <optgroup label="Plans Personnalisés">
                {plans
                  .filter((p) => p.id !== BLANK_PLAN.id && !DEFAULT_PRESETS.some((dp) => dp.id === p.id))
                  .map((custom) => (
                    <option key={custom.id} value={custom.id}>
                      💾 {custom.name} ({custom.rigType.toUpperCase()})
                    </option>
                  ))}
              </optgroup>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {description && (
          <p className="text-[11px] text-neutral-400 italic bg-neutral-900/50 rounded p-2 border border-neutral-800/60 mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Plan General Settings */}
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <span className="text-xs font-semibold uppercase text-neutral-200">
            Paramètres du Plan
          </span>
          <span className="text-[10px] font-mono-tech text-amber-400">RÉGIE CADRAGE</span>
        </div>

        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Nom du Plan :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-100 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Machinerie (Rig) :</label>
            <select
              value={rigType}
              onChange={(e) => setRigType(e.target.value as CustomCameraPlanEntity['rigType'])}
              className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-100 focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="dolly">Rails Dolly</option>
              <option value="crane">Grue / Jib</option>
              <option value="tripod">Trépied Fixe</option>
              <option value="steadicam">Steadicam</option>
              <option value="handheld">Caméra Portée (Épaule)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">Courbe (Easing) :</label>
            <select
              value={easing}
              onChange={(e) => setEasing(e.target.value as EasingType)}
              className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-100 focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="easeInOut">Doux (Ease-In-Out)</option>
              <option value="linear">Linéaire Continu</option>
              <option value="dramatic">Coup de Fouet (Crash)</option>
              <option value="easeIn">Accélération (Ease-In)</option>
              <option value="easeOut">Freinage (Ease-Out)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
            <span>Durée du Plan :</span>
            <span className="font-mono-tech text-white">{durationSeconds.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.5"
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(parseFloat(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Keyframe A (Start) and Keyframe B (End) Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Point A : Départ */}
        <div className="flex flex-col gap-2.5 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
          <span className="text-xs font-semibold text-amber-400 border-b border-neutral-800/80 pb-1">
            Point A : Départ (0%)
          </span>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Focale :</span>
              <span className="font-mono-tech text-white">{startKeyframe.focalMm}mm</span>
            </div>
            <input
              type="range"
              min="18"
              max="135"
              step="1"
              value={startKeyframe.focalMm}
              onChange={(e) =>
                setStartKeyframe((prev) => ({ ...prev, focalMm: parseInt(e.target.value) }))
              }
              className="accent-amber-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Avancée (Dolly Z) :</span>
              <span className="font-mono-tech text-white">{startKeyframe.dollyZ}</span>
            </div>
            <input
              type="range"
              min="-150"
              max="150"
              step="5"
              value={startKeyframe.dollyZ}
              onChange={(e) =>
                setStartKeyframe((prev) => ({ ...prev, dollyZ: parseInt(e.target.value) }))
              }
              className="accent-amber-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Latéral (Truck X) :</span>
              <span className="font-mono-tech text-white">{startKeyframe.truckX}</span>
            </div>
            <input
              type="range"
              min="-150"
              max="150"
              step="5"
              value={startKeyframe.truckX}
              onChange={(e) =>
                setStartKeyframe((prev) => ({ ...prev, truckX: parseInt(e.target.value) }))
              }
              className="accent-amber-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Hauteur (Boom Y) :</span>
              <span className="font-mono-tech text-white">{startKeyframe.boomY}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="5"
              value={startKeyframe.boomY}
              onChange={(e) =>
                setStartKeyframe((prev) => ({ ...prev, boomY: parseInt(e.target.value) }))
              }
              className="accent-amber-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Panoramique (Pan) :</span>
              <span className="font-mono-tech text-white">{startKeyframe.panDeg}°</span>
            </div>
            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={startKeyframe.panDeg}
              onChange={(e) =>
                setStartKeyframe((prev) => ({ ...prev, panDeg: parseInt(e.target.value) }))
              }
              className="accent-amber-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Inclinaison (Tilt) :</span>
              <span className="font-mono-tech text-white">{startKeyframe.tiltDeg}°</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={startKeyframe.tiltDeg}
              onChange={(e) =>
                setStartKeyframe((prev) => ({ ...prev, tiltDeg: parseInt(e.target.value) }))
              }
              className="accent-amber-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Secousse Épaule :</span>
              <span className="font-mono-tech text-white">
                {Math.round(startKeyframe.shakeIntensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={startKeyframe.shakeIntensity}
              onChange={(e) =>
                setStartKeyframe((prev) => ({ ...prev, shakeIntensity: parseFloat(e.target.value) }))
              }
              className="accent-amber-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Point B : Arrivée */}
        <div className="flex flex-col gap-2.5 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
          <span className="text-xs font-semibold text-emerald-400 border-b border-neutral-800/80 pb-1">
            Point B : Arrivée (100%)
          </span>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Focale :</span>
              <span className="font-mono-tech text-white">{endKeyframe.focalMm}mm</span>
            </div>
            <input
              type="range"
              min="18"
              max="135"
              step="1"
              value={endKeyframe.focalMm}
              onChange={(e) =>
                setEndKeyframe((prev) => ({ ...prev, focalMm: parseInt(e.target.value) }))
              }
              className="accent-emerald-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Avancée (Dolly Z) :</span>
              <span className="font-mono-tech text-white">{endKeyframe.dollyZ}</span>
            </div>
            <input
              type="range"
              min="-150"
              max="150"
              step="5"
              value={endKeyframe.dollyZ}
              onChange={(e) =>
                setEndKeyframe((prev) => ({ ...prev, dollyZ: parseInt(e.target.value) }))
              }
              className="accent-emerald-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Latéral (Truck X) :</span>
              <span className="font-mono-tech text-white">{endKeyframe.truckX}</span>
            </div>
            <input
              type="range"
              min="-150"
              max="150"
              step="5"
              value={endKeyframe.truckX}
              onChange={(e) =>
                setEndKeyframe((prev) => ({ ...prev, truckX: parseInt(e.target.value) }))
              }
              className="accent-emerald-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Hauteur (Boom Y) :</span>
              <span className="font-mono-tech text-white">{endKeyframe.boomY}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="5"
              value={endKeyframe.boomY}
              onChange={(e) =>
                setEndKeyframe((prev) => ({ ...prev, boomY: parseInt(e.target.value) }))
              }
              className="accent-emerald-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Panoramique (Pan) :</span>
              <span className="font-mono-tech text-white">{endKeyframe.panDeg}°</span>
            </div>
            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={endKeyframe.panDeg}
              onChange={(e) =>
                setEndKeyframe((prev) => ({ ...prev, panDeg: parseInt(e.target.value) }))
              }
              className="accent-emerald-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Inclinaison (Tilt) :</span>
              <span className="font-mono-tech text-white">{endKeyframe.tiltDeg}°</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={endKeyframe.tiltDeg}
              onChange={(e) =>
                setEndKeyframe((prev) => ({ ...prev, tiltDeg: parseInt(e.target.value) }))
              }
              className="accent-emerald-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Secousse Épaule :</span>
              <span className="font-mono-tech text-white">
                {Math.round(endKeyframe.shakeIntensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={endKeyframe.shakeIntensity}
              onChange={(e) =>
                setEndKeyframe((prev) => ({ ...prev, shakeIntensity: parseFloat(e.target.value) }))
              }
              className="accent-emerald-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={handleApplyCurrentPlan}
          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-amber-500 py-2.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>Tester sur le Simulateur Plateau</span>
        </button>

        <button
          type="button"
          onClick={handleCopySpecs}
          title="Copier les paramètres techniques"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
