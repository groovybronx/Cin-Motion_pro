export interface GlossaryTermDto {
  readonly key: string;
  readonly term: string;
  readonly category: 'optique' | 'machinerie' | 'cadrage' | 'mise-en-scene';
  readonly categoryLabel: string;
  readonly definition: string;
  readonly concreteExample: string;
  readonly technicalTip: string;
}
