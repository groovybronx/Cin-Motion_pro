import { MovementCategory, MovementId } from '../../domain/entities/camera-movement.entity.ts';

export interface FilmExampleDto {
  readonly filmTitle: string;
  readonly director: string;
  readonly year: number;
  readonly sceneDescription: string;
  readonly emotionalReason: string;
}

export interface EquipmentDto {
  readonly toolName: string;
  readonly roleDescription: string;
  readonly stabilityLevel: 'fixe' | 'sur-rail' | 'stabilisé' | 'grue' | 'porté';
}

export interface CameraMovementDto {
  readonly id: MovementId;
  readonly frenchName: string;
  readonly originalName: string;
  readonly category: MovementCategory;
  readonly categoryLabel: string;
  readonly shortDefinition: string;
  readonly mechanicalAxis: string;
  readonly emotionalImpact: string;
  readonly narrativeUsage: string;
  readonly technicalExecution: string;
  readonly keyDifferences: string;
  readonly iconicExamples: readonly FilmExampleDto[];
  readonly equipment: readonly EquipmentDto[];
}
