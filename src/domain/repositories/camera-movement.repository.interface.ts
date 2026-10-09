import { CameraMovementEntity, MovementCategory, MovementId } from '../entities/camera-movement.entity.ts';

export interface ICameraMovementRepository {
  getAllMovements(): Promise<readonly CameraMovementEntity[]>;
  getMovementById(id: MovementId): Promise<CameraMovementEntity | null>;
  getMovementsByCategory(category: MovementCategory): Promise<readonly CameraMovementEntity[]>;
}
