export type LayerRole = 'background' | 'midground' | 'subject' | 'foreground';

export interface ImageSceneLayer {
  readonly id: string;
  readonly role: LayerRole;
  readonly label: string;
  readonly zIndex: number;
  readonly depthZ: number; // Z-axis coordinates for 3D behind-the-scenes view (-250 to +150)
  readonly depthFactor: number; // Displacement multiplier (e.g. 0.2 for bg, 1.0 for fg)
  readonly blurPx: number;
  readonly dataUrl: string; // Transparent PNG for subjects or clean plate for background
  readonly editPrompt?: string;
  readonly isVisible: boolean;
  readonly opacity: number;
}

export interface CustomImageSceneEntity {
  readonly id: string;
  readonly originalImageUrl: string;
  readonly width: number;
  readonly height: number;
  readonly sceneDescription: string;
  readonly compositionType: string;
  readonly recommendedMovementId?: string;
  readonly cinematicAdvice?: string;
  readonly layers: readonly ImageSceneLayer[];
  readonly usedModel?: string;
}
