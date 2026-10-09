import { MovementId, TrajectoryKeyframe } from '../entities/camera-movement.entity.ts';
import { CustomCameraPlanEntity, EasingType } from '../entities/custom-camera-plan.entity.ts';

export interface ViewportSimulationState {
  readonly cameraPosition: { readonly x: number; readonly y: number; readonly z: number };
  readonly cameraRotation: { readonly pan: number; readonly tilt: number; readonly roll: number };
  readonly focalMultiplier: number;
  readonly foregroundOffset: { readonly x: number; readonly y: number; readonly scale: number };
  readonly subjectOffset: { readonly x: number; readonly y: number; readonly scale: number };
  readonly backgroundOffset: { readonly x: number; readonly y: number; readonly scale: number };
  readonly handheldShake: { readonly x: number; readonly y: number; readonly angle: number };
  readonly focalLengthMm: number;
  readonly depthOfFieldBlurPx: number;
}

export interface ManualCameraOverrides {
  readonly panOffsetDeg: number;
  readonly tiltOffsetDeg: number;
  readonly rollOffsetDeg: number;
  readonly focalMultiplier: number;
  readonly isManualMode: boolean;
}

export class CinematicCalculationService {
  /**
   * Calculates kinematic simulation state for user-defined custom camera plans.
   */
  public calculateCustomPlanSimulationState(
    plan: CustomCameraPlanEntity,
    progress: number,
    timeMs: number = 0
  ): ViewportSimulationState {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const factor = this.applyEasing(plan.easing, clampedProgress);

    const { startKeyframe: start, endKeyframe: end } = plan;

    const panDeg = start.panDeg + (end.panDeg - start.panDeg) * factor;
    const tiltDeg = start.tiltDeg + (end.tiltDeg - start.tiltDeg) * factor;
    const rollDeg = start.rollDeg + (end.rollDeg - start.rollDeg) * factor;

    const truckX = start.truckX + (end.truckX - start.truckX) * factor;
    const boomY = start.boomY + (end.boomY - start.boomY) * factor;
    const dollyZ = start.dollyZ + (end.dollyZ - start.dollyZ) * factor;

    const focalMm = start.focalMm + (end.focalMm - start.focalMm) * factor;
    const focalMultiplier = focalMm / 35;

    const shakeIntensity =
      start.shakeIntensity + (end.shakeIntensity - start.shakeIntensity) * factor;

    let shakeX = 0;
    let shakeY = 0;
    let shakeAngle = 0;

    if (shakeIntensity > 0) {
      const t = timeMs * 0.003;
      shakeX = (Math.sin(t * 1.5) * 6 + Math.cos(t * 2.8) * 4) * shakeIntensity;
      shakeY = (Math.cos(t * 1.9) * 5 + Math.sin(t * 3.3) * 3) * shakeIntensity;
      shakeAngle = Math.sin(t * 1.1) * 2.5 * shakeIntensity;
    }

    const panShiftX = panDeg * -12 - truckX * 0.8;
    const tiltShiftY = tiltDeg * 8 + boomY * 0.6;

    const dollySubjectScale = Math.max(0.4, Math.min(2.5, 1.0 + (dollyZ / 140) * 0.6));
    const dollyBgScale = Math.max(0.6, Math.min(1.8, 1.0 + (dollyZ / 140) * 0.2));

    return {
      cameraPosition: { x: truckX, y: boomY, z: dollyZ },
      cameraRotation: { pan: panDeg, tilt: tiltDeg, roll: rollDeg },
      focalMultiplier,
      foregroundOffset: {
        x: panShiftX * 1.5 + shakeX * 1.3,
        y: tiltShiftY * 1.5 + shakeY * 1.3,
        scale: Math.max(0.5, focalMultiplier * (1.0 + (dollyZ / 140) * 1.1)),
      },
      subjectOffset: {
        x: panShiftX * 1.0 + shakeX * 0.9,
        y: tiltShiftY * 1.0 + shakeY * 0.9,
        scale: Math.max(0.4, focalMultiplier * dollySubjectScale),
      },
      backgroundOffset: {
        x: panShiftX * 0.45 + shakeX * 0.4,
        y: tiltShiftY * 0.4 + shakeY * 0.4,
        scale: Math.max(0.5, focalMultiplier * dollyBgScale),
      },
      handheldShake: { x: shakeX, y: shakeY, angle: shakeAngle },
      focalLengthMm: focalMm,
      depthOfFieldBlurPx: Math.max(0, (focalMm - 35) * 0.04),
    };
  }

  private applyEasing(easing: EasingType, t: number): number {
    switch (easing) {
      case 'linear':
        return t;
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return 1 - (1 - t) * (1 - t);
      case 'dramatic':
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      case 'easeInOut':
      default:
        return 0.5 - Math.cos(t * Math.PI) * 0.5;
    }
  }

  /**
   * Calculates the full 3D and 2D kinematic transformation for a camera movement
   * at a normalized progress ratio between 0.0 and 1.0, with optional real-time manual overrides.
   */
  public calculateSimulationState(
    movementId: MovementId,
    progress: number,
    timeMs: number = 0,
    manualOverrides?: ManualCameraOverrides
  ): ViewportSimulationState {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    // Smooth sinusoidal motion curve: 0 to 1 with smooth acceleration/deceleration
    const eased = 0.5 - Math.cos(clampedProgress * Math.PI) * 0.5;

    const baseState = manualOverrides?.isManualMode
      ? this.getNeutralState()
      : this.computeBaseStateByMovement(movementId, eased, clampedProgress, timeMs);

    if (!manualOverrides) {
      return baseState;
    }

    // Apply manual real-time user manipulation (drag pan, drag tilt, roll, and zoom)
    const combinedPan = baseState.cameraRotation.pan + manualOverrides.panOffsetDeg;
    const combinedTilt = baseState.cameraRotation.tilt + manualOverrides.tiltOffsetDeg;
    const combinedRoll = baseState.cameraRotation.roll + manualOverrides.rollOffsetDeg;
    const combinedFocalMult = baseState.focalMultiplier * manualOverrides.focalMultiplier;

    const panPxShift = combinedPan * -12;
    const tiltPyShift = combinedTilt * 8;

    return {
      cameraPosition: baseState.cameraPosition,
      cameraRotation: {
        pan: combinedPan,
        tilt: combinedTilt,
        roll: combinedRoll,
      },
      focalMultiplier: combinedFocalMult,
      foregroundOffset: {
        x: baseState.foregroundOffset.x + panPxShift * 1.5,
        y: baseState.foregroundOffset.y + tiltPyShift * 1.5,
        scale: baseState.foregroundOffset.scale * combinedFocalMult,
      },
      subjectOffset: {
        x: baseState.subjectOffset.x + panPxShift * 1.0,
        y: baseState.subjectOffset.y + tiltPyShift * 1.0,
        scale: baseState.subjectOffset.scale * combinedFocalMult,
      },
      backgroundOffset: {
        x: baseState.backgroundOffset.x + panPxShift * 0.45,
        y: baseState.backgroundOffset.y + tiltPyShift * 0.4,
        scale: baseState.backgroundOffset.scale * combinedFocalMult,
      },
      handheldShake: baseState.handheldShake,
      focalLengthMm: baseState.focalLengthMm * combinedFocalMult,
      depthOfFieldBlurPx: baseState.depthOfFieldBlurPx,
    };
  }

  private computeBaseStateByMovement(
    movementId: MovementId,
    eased: number,
    clampedProgress: number,
    timeMs: number
  ): ViewportSimulationState {
    switch (movementId) {
      case 'pan':
        return this.computePanState(eased);
      case 'tilt':
        return this.computeTiltState(eased);
      case 'dolly-in':
        return this.computeDollyInState(eased);
      case 'dolly-out':
        return this.computeDollyOutState(eased);
      case 'tracking-lateral':
        return this.computeTrackingLateralState(eased);
      case 'boom-pedestal':
        return this.computeBoomPedestalState(eased);
      case 'zoom-in':
        return this.computeZoomInState(eased);
      case 'dolly-zoom':
        return this.computeDollyZoomState(eased);
      case 'roll-dutch':
        return this.computeRollDutchState(eased);
      case 'orbit-360':
        return this.computeOrbitState(eased);
      case 'handheld':
        return this.computeHandheldState(clampedProgress, timeMs);
      default:
        return this.getNeutralState();
    }
  }

  private computePanState(eased: number): ViewportSimulationState {
    // Rotation on vertical axis from -28 deg to +28 deg (horizontal swing)
    const panDeg = (eased - 0.5) * 56;
    const pxShift = panDeg * -12; // Viewport shifts opposite to camera rotation

    return {
      cameraPosition: { x: 0, y: 0, z: 0 },
      cameraRotation: { pan: panDeg, tilt: 0, roll: 0 },
      focalMultiplier: 1.0,
      foregroundOffset: { x: pxShift * 1.6, y: 0, scale: 1.0 },
      subjectOffset: { x: pxShift * 1.0, y: 0, scale: 1.0 },
      backgroundOffset: { x: pxShift * 0.45, y: 0, scale: 1.0 },
      handheldShake: { x: 0, y: 0, angle: 0 },
      focalLengthMm: 35,
      depthOfFieldBlurPx: 0,
    };
  }

  private computeTiltState(eased: number): ViewportSimulationState {
    // Rotation on horizontal axis from +18 deg (low looking up) to -22 deg (high looking down)
    const tiltDeg = (0.5 - eased) * 40;
    const pyShift = tiltDeg * 8;

    return {
      cameraPosition: { x: 0, y: 0, z: 0 },
      cameraRotation: { pan: 0, tilt: tiltDeg, roll: 0 },
      focalMultiplier: 1.0,
      foregroundOffset: { x: 0, y: pyShift * 1.5, scale: 1.0 },
      subjectOffset: { x: 0, y: pyShift * 1.0, scale: 1.0 },
      backgroundOffset: { x: 0, y: pyShift * 0.4, scale: 1.0 },
      handheldShake: { x: 0, y: 0, angle: 0 },
      focalLengthMm: 35,
      depthOfFieldBlurPx: 0,
    };
  }

  private computeDollyInState(eased: number): ViewportSimulationState {
    // Physical translation forward: camera moves closer to subject
    const zMove = eased * 120; // 0 to 120 units forward
    const subjectScale = 0.85 + eased * 0.65; // Subject grows significantly
    const backgroundScale = 0.95 + eased * 0.22; // Background grows much slower due to 3D perspective

    return {
      cameraPosition: { x: 0, y: 0, z: zMove },
      cameraRotation: { pan: 0, tilt: 0, roll: 0 },
      focalMultiplier: 1.0,
      foregroundOffset: { x: 0, y: eased * -20, scale: 1.0 + eased * 1.4 },
      subjectOffset: { x: 0, y: 0, scale: subjectScale },
      backgroundOffset: { x: 0, y: 0, scale: backgroundScale },
      handheldShake: { x: 0, y: 0, angle: 0 },
      focalLengthMm: 35,
      depthOfFieldBlurPx: eased * 2.5,
    };
  }

  private computeDollyOutState(eased: number): ViewportSimulationState {
    // Physical translation backwards: camera moves away
    const invEased = 1 - eased;
    const zMove = invEased * 120;
    const subjectScale = 1.4 - eased * 0.55;
    const backgroundScale = 1.15 - eased * 0.2;

    return {
      cameraPosition: { x: 0, y: 0, z: zMove },
      cameraRotation: { pan: 0, tilt: 0, roll: 0 },
      focalMultiplier: 1.0,
      foregroundOffset: { x: 0, y: 0, scale: 2.2 - eased * 1.2 },
      subjectOffset: { x: 0, y: 0, scale: subjectScale },
      backgroundOffset: { x: 0, y: 0, scale: backgroundScale },
      handheldShake: { x: 0, y: 0, angle: 0 },
      focalLengthMm: 35,
      depthOfFieldBlurPx: (1 - eased) * 2.5,
    };
  }

  private computeTrackingLateralState(eased: number): ViewportSimulationState {
    // Camera moves sideways parallel to subject
    const xTravel = (eased - 0.5) * 160;
    // Strong parallax: foreground moves faster than subject, background moves slowest
    return {
      cameraPosition: { x: xTravel, y: 0, z: 0 },
      cameraRotation: { pan: 0, tilt: 0, roll: 0 },
      focalMultiplier: 1.0,
      foregroundOffset: { x: -xTravel * 2.1, y: 0, scale: 1.0 },
      subjectOffset: { x: 0, y: 0, scale: 1.0 }, // Subject stays centered as camera tracks with it
      backgroundOffset: { x: -xTravel * 0.35, y: 0, scale: 1.0 },
      handheldShake: { x: 0, y: 0, angle: 0 },
      focalLengthMm: 50,
      depthOfFieldBlurPx: 1.0,
    };
  }

  private computeBoomPedestalState(eased: number): ViewportSimulationState {
    // Physical vertical translation (crane / pedestal up & down)
    const yTravel = (eased - 0.5) * 110;
    const tiltSlight = (0.5 - eased) * 12; // Camera angles slightly down when elevated

    return {
      cameraPosition: { x: 0, y: yTravel, z: 0 },
      cameraRotation: { pan: 0, tilt: tiltSlight, roll: 0 },
      focalMultiplier: 1.0,
      foregroundOffset: { x: 0, y: yTravel * 1.8, scale: 1.0 },
      subjectOffset: { x: 0, y: yTravel * 0.9, scale: 1.0 },
      backgroundOffset: { x: 0, y: yTravel * 0.3, scale: 1.0 },
      handheldShake: { x: 0, y: 0, angle: 0 },
      focalLengthMm: 40,
      depthOfFieldBlurPx: 0.5,
    };
  }

  private computeZoomInState(eased: number): ViewportSimulationState {
    // Optical zoom: camera stays still at (0,0,0), focal length multiplies
    // Notice: Both subject AND background magnify equally (optical compression, no 3D parallax shift)
    const zoomFactor = 1.0 + eased * 1.4;
    const focalMm = 28 + eased * 72; // 28mm to 100mm telephoto

    return {
      cameraPosition: { x: 0, y: 0, z: 0 }, // Physical camera DOES NOT MOVE
      cameraRotation: { pan: 0, tilt: 0, roll: 0 },
      focalMultiplier: zoomFactor,
      foregroundOffset: { x: 0, y: 0, scale: zoomFactor },
      subjectOffset: { x: 0, y: 0, scale: zoomFactor },
      backgroundOffset: { x: 0, y: 0, scale: zoomFactor }, // Same magnification: flattened planes!
      handheldShake: { x: 0, y: 0, angle: 0 },
      focalLengthMm: focalMm,
      depthOfFieldBlurPx: eased * 4.0, // Long telephoto yields shallower depth of field
    };
  }

  private computeDollyZoomState(eased: number): ViewportSimulationState {
    // The Vertigo effect: Dolly IN physically + Zoom OUT optically (or vice-versa)
    // Result: Subject remains EXACTLY the same size, while the background dramatically warps & expands!
    const zMove = eased * 140; // Camera moves forward physically
    const opticalZoom = 1.6 - eased * 0.8; // Lens zooms out from 70mm to 24mm
    const backgroundDilation = 0.55 + eased * 1.1; // Background perspective drastically shifts

    return {
      cameraPosition: { x: 0, y: 0, z: zMove },
      cameraRotation: { pan: 0, tilt: 0, roll: 0 },
      focalMultiplier: opticalZoom,
      foregroundOffset: { x: 0, y: 0, scale: 1.0 + eased * 1.2 },
      subjectOffset: { x: 0, y: 0, scale: 1.0 }, // SUBJECT SIZE REMAINS LOCKED (constant framing!)
      backgroundOffset: { x: 0, y: 0, scale: backgroundDilation }, // Background expands wildly!
      handheldShake: { x: 0, y: 0, angle: 0 },
      focalLengthMm: 85 - eased * 55, // 85mm -> 30mm
      depthOfFieldBlurPx: (1 - eased) * 3.0,
    };
  }

  private computeRollDutchState(eased: number): ViewportSimulationState {
    // Rotation along the optical Z-axis (Dutch angle / Cant / Roulis)
    const rollAngle = (eased - 0.5) * 36; // -18 deg to +18 deg tilt

    return {
      cameraPosition: { x: 0, y: 0, z: 0 },
      cameraRotation: { pan: 0, tilt: 0, roll: rollAngle },
      focalMultiplier: 1.0,
      foregroundOffset: { x: 0, y: 0, scale: 1.05 },
      subjectOffset: { x: 0, y: 0, scale: 1.0 },
      backgroundOffset: { x: 0, y: 0, scale: 1.0 },
      handheldShake: { x: 0, y: 0, angle: 0 },
      focalLengthMm: 35,
      depthOfFieldBlurPx: 0,
    };
  }

  private computeOrbitState(eased: number): ViewportSimulationState {
    // Circular arc around the subject (360 deg or semi-circular arc)
    const angleRad = (eased - 0.5) * Math.PI * 1.4; // -126 deg to +126 deg
    const radius = 100;
    const camX = Math.sin(angleRad) * radius;
    const camZ = (1 - Math.cos(angleRad)) * radius;
    const panDeg = -angleRad * (180 / Math.PI); // Camera faces center of the ring

    return {
      cameraPosition: { x: camX, y: 0, z: camZ },
      cameraRotation: { pan: panDeg, tilt: 0, roll: 0 },
      focalMultiplier: 1.0,
      foregroundOffset: { x: -angleRad * 240, y: 0, scale: 1.0 },
      subjectOffset: { x: 0, y: 0, scale: 1.0 }, // Subject stays fixed at focal center
      backgroundOffset: { x: angleRad * 160, y: 0, scale: 1.05 },
      handheldShake: { x: 0, y: 0, angle: 0 },
      focalLengthMm: 50,
      depthOfFieldBlurPx: 1.8,
    };
  }

  private computeHandheldState(progress: number, timeMs: number): ViewportSimulationState {
    // Organic, imperfect micro-oscillations simulating human shoulder breathing and steps
    const t = timeMs * 0.003;
    const shakeX = Math.sin(t * 1.3) * 6 + Math.cos(t * 2.7) * 4;
    const shakeY = Math.cos(t * 1.7) * 5 + Math.sin(t * 3.1) * 3;
    const shakeAngle = Math.sin(t * 0.9) * 1.8;

    return {
      cameraPosition: { x: shakeX * 0.8, y: shakeY * 0.8, z: 0 },
      cameraRotation: { pan: shakeX * 0.4, tilt: shakeY * 0.4, roll: shakeAngle },
      focalMultiplier: 1.0,
      foregroundOffset: { x: shakeX * 1.4, y: shakeY * 1.4, scale: 1.0 },
      subjectOffset: { x: shakeX * 0.9, y: shakeY * 0.9, scale: 1.0 },
      backgroundOffset: { x: shakeX * 0.3, y: shakeY * 0.3, scale: 1.0 },
      handheldShake: { x: shakeX, y: shakeY, angle: shakeAngle },
      focalLengthMm: 40,
      depthOfFieldBlurPx: 0.5,
    };
  }

  private getNeutralState(): ViewportSimulationState {
    return {
      cameraPosition: { x: 0, y: 0, z: 0 },
      cameraRotation: { pan: 0, tilt: 0, roll: 0 },
      focalMultiplier: 1.0,
      foregroundOffset: { x: 0, y: 0, scale: 1.0 },
      subjectOffset: { x: 0, y: 0, scale: 1.0 },
      backgroundOffset: { x: 0, y: 0, scale: 1.0 },
      handheldShake: { x: 0, y: 0, angle: 0 },
      focalLengthMm: 35,
      depthOfFieldBlurPx: 0,
    };
  }
}
