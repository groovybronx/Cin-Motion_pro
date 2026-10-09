import { CameraMovementEntity, MovementCategory } from '../../domain/entities/camera-movement.entity.ts';
import { CameraMovementDto } from '../dtos/camera-movement.dto.ts';

export class CameraMovementMapper {
  private static readonly CATEGORY_LABELS: Record<MovementCategory, string> = {
    axis: 'Mouvements sur Axe Fixe',
    physical: 'Déplacements Physiques',
    optical: 'Optiques & Hybrides',
    organic: 'Mouvements Organiques',
  };

  public static toDto(entity: CameraMovementEntity): CameraMovementDto {
    return {
      id: entity.id,
      frenchName: entity.frenchName,
      originalName: entity.originalName,
      category: entity.category,
      categoryLabel: CameraMovementMapper.CATEGORY_LABELS[entity.category],
      shortDefinition: entity.shortDefinition,
      mechanicalAxis: entity.mechanicalAxis,
      emotionalImpact: entity.emotionalImpact,
      narrativeUsage: entity.narrativeUsage,
      technicalExecution: entity.technicalExecution,
      keyDifferences: entity.keyDifferences,
      iconicExamples: entity.iconicExamples.map((ex) => ({
        filmTitle: ex.filmTitle,
        director: ex.director,
        year: ex.year,
        sceneDescription: ex.sceneDescription,
        emotionalReason: ex.emotionalReason,
      })),
      equipment: entity.equipment.map((eq) => ({
        toolName: eq.toolName,
        roleDescription: eq.roleDescription,
        stabilityLevel: eq.stabilityLevel,
      })),
    };
  }
}
