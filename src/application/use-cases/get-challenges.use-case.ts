import { DirectorChallengeEntity } from '../../domain/entities/director-challenge.entity.ts';
import { IChallengeRepository } from '../../domain/repositories/challenge.repository.interface.ts';

export class GetChallengesUseCase {
  constructor(private readonly repository: IChallengeRepository) {}

  public async execute(): Promise<readonly DirectorChallengeEntity[]> {
    return this.repository.getAllChallenges();
  }
}
