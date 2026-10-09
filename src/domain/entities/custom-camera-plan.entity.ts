export type EasingType = 'easeInOut' | 'linear' | 'easeIn' | 'easeOut' | 'dramatic';

export interface CameraKeyframeConfig {
  readonly panDeg: number;       // -45° to +45°
  readonly tiltDeg: number;      // -35° to +35°
  readonly rollDeg: number;      // -45° to +45°
  readonly dollyZ: number;       // -120 to +140 (profondeur)
  readonly truckX: number;       // -160 to +160 (latéral)
  readonly boomY: number;        // -80 to +120 (hauteur)
  readonly focalMm: number;      // 18mm to 135mm
  readonly shakeIntensity: number; // 0 (statique) à 1 (secousses épaule)
}

export interface CustomCameraPlanEntity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly durationSeconds: number;
  readonly easing: EasingType;
  readonly startKeyframe: CameraKeyframeConfig;
  readonly endKeyframe: CameraKeyframeConfig;
  readonly rigType: 'tripod' | 'dolly' | 'crane' | 'steadicam' | 'handheld';
}
