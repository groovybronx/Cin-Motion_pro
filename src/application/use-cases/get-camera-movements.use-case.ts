import { ICameraMovementRepository } from '../../domain/repositories/camera-movement.repository.interface.ts';
import { CameraMovementDto } from '../dtos/camera-movement.dto.ts';
import { CameraMovementMapper } from '../mappers/camera-movement.mapper.ts';

export class GetCameraMovementsUseCase {
  constructor(private readonly repository: ICameraMovementRepository) {}

  public async execute(): Promise<readonly CameraMovementDto[]> {
    const movements = await this.repository.getAllMovements();
    return movements.map((movement) => CameraMovementMapper.toDto(movement));
  }
}
