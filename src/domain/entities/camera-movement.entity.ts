export type MovementCategory = 'axis' | 'physical' | 'optical' | 'organic';

export type MovementId =
  | 'pan'
  | 'tilt'
  | 'dolly-in'
  | 'dolly-out'
  | 'tracking-lateral'
  | 'boom-pedestal'
  | 'zoom-in'
  | 'dolly-zoom'
  | 'roll-dutch'
  | 'orbit-360'
  | 'handheld';

export interface CinematicExample {
  readonly filmTitle: string;
  readonly director: string;
  readonly year: number;
  readonly sceneDescription: string;
  readonly emotionalReason: string;
}

export interface EquipmentRequirement {
  readonly toolName: string;
  readonly roleDescription: string;
  readonly stabilityLevel: 'fixe' | 'sur-rail' | 'stabilisé' | 'grue' | 'porté';
}

export interface TrajectoryKeyframe {
  readonly progress: number; // 0 to 1
  readonly cameraPosition: { readonly x: number; readonly y: number; readonly z: number };
  readonly cameraRotation: { readonly pan: number; readonly tilt: number; readonly roll: number };
  readonly focalLengthMultiplier: number; // 1 = normal, >1 = telephoto, <1 = wide
  readonly subjectDisplacement: { readonly x: number; readonly y: number; readonly z: number };
  readonly backgroundDisplacement: { readonly x: number; readonly y: number; readonly z: number };
  readonly cameraShake: number; // 0 to 1
}

export interface CameraMovementEntity {
  readonly id: MovementId;
  readonly frenchName: string;
  readonly originalName: string;
  readonly category: MovementCategory;
  readonly shortDefinition: string;
  readonly mechanicalAxis: string;
  readonly emotionalImpact: string;
  readonly narrativeUsage: string;
  readonly technicalExecution: string;
  readonly keyDifferences: string;
  readonly iconicExamples: readonly CinematicExample[];
  readonly equipment: readonly EquipmentRequirement[];
}
