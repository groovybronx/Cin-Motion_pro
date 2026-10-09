import { DirectorChallengeEntity } from '../entities/director-challenge.entity.ts';

export interface IChallengeRepository {
  getAllChallenges(): Promise<readonly DirectorChallengeEntity[]>;
  getChallengeById(id: string): Promise<DirectorChallengeEntity | null>;
}
