import { MovementId } from './camera-movement.entity.ts';

export interface DirectorChallengeEntity {
  readonly id: string;
  readonly title: string;
  readonly scenarioContext: string;
  readonly directorBrief: string;
  readonly targetMovementId: MovementId;
  readonly minPan?: number;
  readonly maxPan?: number;
  readonly minTilt?: number;
  readonly maxTilt?: number;
  readonly minFocal?: number;
  readonly maxFocal?: number;
  readonly hint: string;
  readonly successMessage: string;
}
