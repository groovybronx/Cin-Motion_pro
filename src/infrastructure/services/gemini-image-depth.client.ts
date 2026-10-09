import {
  GeminiAnalyzeImageRequestDto,
  GeminiAnalyzeImageResponseDto,
} from '../../application/dtos/gemini-image-depth.dto.ts';

export class GeminiImageDepthClient {
  /**
   * Calls the server-side Gemini 3.8 Flash multimodal analysis endpoint.
   */
  public async analyzeImage(
    request: GeminiAnalyzeImageRequestDto
  ): Promise<GeminiAnalyzeImageResponseDto> {
    const response = await fetch('/api/analyze-image-depth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message =
        typeof errorBody === 'object' && errorBody !== null && 'error' in errorBody
          ? String(errorBody.error)
          : `Erreur serveur HTTP ${response.status}`;
      throw new Error(message);
    }

    const data: GeminiAnalyzeImageResponseDto = await response.json();
    return data;
  }
}
