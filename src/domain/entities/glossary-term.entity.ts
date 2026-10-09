export interface GlossaryTermEntity {
  readonly key: string;
  readonly term: string;
  readonly category: 'optique' | 'machinerie' | 'cadrage' | 'mise-en-scene';
  readonly definition: string;
  readonly concreteExample: string;
  readonly technicalTip: string;
}
