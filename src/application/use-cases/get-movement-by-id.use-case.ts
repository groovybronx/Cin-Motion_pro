import { MovementId } from '../../domain/entities/camera-movement.entity.ts';
import { ICameraMovementRepository } from '../../domain/repositories/camera-movement.repository.interface.ts';
import { CameraMovementDto } from '../dtos/camera-movement.dto.ts';
import { CameraMovementMapper } from '../mappers/camera-movement.mapper.ts';

export class GetMovementByIdUseCase {
  constructor(private readonly repository: ICameraMovementRepository) {}

  public async execute(id: MovementId): Promise<CameraMovementDto | null> {
    const movement = await this.repository.getMovementById(id);
    if (!movement) {
      return null;
    }
    return CameraMovementMapper.toDto(movement);
  }
}
