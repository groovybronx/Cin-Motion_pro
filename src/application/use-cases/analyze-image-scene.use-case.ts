import { CustomImageSceneEntity } from '../../domain/entities/custom-image-scene.entity.ts';
import { GeminiImageDepthClient } from '../../infrastructure/services/gemini-image-depth.client.ts';
import { ImageLayerExtractorService } from '../../infrastructure/services/image-layer-extractor.service.ts';

export class AnalyzeImageSceneUseCase {
  constructor(
    private readonly geminiClient: GeminiImageDepthClient = new GeminiImageDepthClient(),
    private readonly layerExtractor: ImageLayerExtractorService = new ImageLayerExtractorService()
  ) {}

  public async execute(dataUrl: string): Promise<CustomImageSceneEntity> {
    if (!dataUrl) {
      throw new Error("Aucune image fournie pour l'analyse.");
    }

    // Step 1: Call Gemini 3.8 Flash multimodal endpoint
    const aiAnalysis = await this.geminiClient.analyzeImage({
      imageBase64: dataUrl,
    });

    // Step 2: Extract pristine transparent layers and depth hierarchy
    const sceneEntity = await this.layerExtractor.extractSceneLayers(dataUrl, aiAnalysis);

    return sceneEntity;
  }
}
