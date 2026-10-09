export interface GeminiAnalyzeImageRequestDto {
  readonly imageBase64: string;
  readonly mimeType?: string;
}

export interface GeminiSceneLayerDto {
  readonly id: string;
  readonly name: string;
  readonly role: 'background' | 'foreground' | 'subject' | 'midground';
  readonly zIndex: number;
  readonly depthFactor: number;
  readonly editPrompt: string;
  readonly plateDataUrl?: string | null;
}

export interface GeminiAnalyzeImageResponseDto {
  readonly totalLayers: number;
  readonly sceneDescription: string;
  readonly compositionType: string;
  readonly recommendedMovementId: string;
  readonly cinematicAdvice: string;
  readonly layers: readonly GeminiSceneLayerDto[];
  readonly usedModel?: string;
}
