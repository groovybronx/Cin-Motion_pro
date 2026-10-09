import { GlossaryTermEntity } from '../entities/glossary-term.entity.ts';

export interface IGlossaryRepository {
  getAllTerms(): Promise<readonly GlossaryTermEntity[]>;
  getTermByKey(key: string): Promise<GlossaryTermEntity | null>;
  searchTerms(query: string): Promise<readonly GlossaryTermEntity[]>;
}
