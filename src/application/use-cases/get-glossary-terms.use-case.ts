import { IGlossaryRepository } from '../../domain/repositories/glossary.repository.interface.ts';
import { GlossaryTermDto } from '../dtos/glossary-term.dto.ts';

export class GetGlossaryTermsUseCase {
  private static readonly CATEGORY_LABELS: Record<string, string> = {
    optique: 'Optique & Objectifs',
    machinerie: 'Machinerie & Supports',
    cadrage: 'Cadrage & Composition',
    'mise-en-scene': 'Mise en Scène',
  };

  constructor(private readonly repository: IGlossaryRepository) {}

  public async execute(searchQuery?: string): Promise<readonly GlossaryTermDto[]> {
    const terms = searchQuery
      ? await this.repository.searchTerms(searchQuery)
      : await this.repository.getAllTerms();

    return terms.map((t) => ({
      key: t.key,
      term: t.term,
      category: t.category,
      categoryLabel: GetGlossaryTermsUseCase.CATEGORY_LABELS[t.category] ?? 'Général',
      definition: t.definition,
      concreteExample: t.concreteExample,
      technicalTip: t.technicalTip,
    }));
  }
}
