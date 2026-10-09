import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Allow large image uploads (base64 data)
app.use(express.json({ limit: '35mb' }));

// Server-side Gemini Client Initialization
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory cache for dynamically discovered Gemini 3+ models
let cachedGemini3Models: readonly string[] = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Baseline priority hierarchy for Gemini 3+ models.
 */
const PREFERRED_GEMINI_3_PRIORITY: readonly string[] = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview',
  'gemini-3-flash-preview',
];

/**
 * Dynamically queries the Gemini API to retrieve models available to the current API key,
 * filters out all obsolete models (< Gemini 3), and establishes the cascade fallback order.
 */
async function resolveGemini3Models(aiClient: GoogleGenAI): Promise<readonly string[]> {
  const now = Date.now();
  if (cachedGemini3Models.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedGemini3Models;
  }

  try {
    const modelList = await aiClient.models.list();
    const availableModelNames = new Set<string>();

    for await (const m of modelList) {
      if (typeof m.name === 'string') {
        const cleanName = m.name.replace(/^models\//, '');
        availableModelNames.add(cleanName);
      }
    }

    // Filter to retain strictly Gemini 3+ models (excluding all gemini-1.*, gemini-2.*, etc.)
    const filteredModels = Array.from(availableModelNames).filter((name) => {
      // Must be a gemini model
      if (!name.startsWith('gemini-') && name !== 'gemini-flash-latest') return false;
      // Strictly exclude any legacy/obsolete models (< gemini 3)
      if (name.startsWith('gemini-1.') || name.startsWith('gemini-2.') || name === 'gemini-pro') {
        return false;
      }
      // Exclude audio-only, transcribe, tts, embedding, robotics, native-audio
      if (
        name.includes('tts') ||
        name.includes('transcribe') ||
        name.includes('live') ||
        name.includes('embedding') ||
        name.includes('robotics') ||
        name.includes('native-audio')
      ) {
        return false;
      }
      return true;
    });

    // Sort according to prioritized hierarchy
    filteredModels.sort((a, b) => {
      const idxA = PREFERRED_GEMINI_3_PRIORITY.indexOf(a);
      const idxB = PREFERRED_GEMINI_3_PRIORITY.indexOf(b);
      const scoreA = idxA !== -1 ? idxA : 999;
      const scoreB = idxB !== -1 ? idxB : 999;
      return scoreA - scoreB;
    });

    if (filteredModels.length > 0) {
      cachedGemini3Models = filteredModels;
      cacheTimestamp = now;
      console.log(`[CinéMotion Studio 2.5D] Modèles Gemini 3+ détectés dynamiquement via l'API (${filteredModels.length}) :`, filteredModels);
      return cachedGemini3Models;
    }
  } catch (error) {
    console.warn('[CinéMotion Studio 2.5D] Avertissement lors de la détection API des modèles, utilisation de la hiérarchie de repli :', error);
  }

  // Fallback to verified Gemini 3+ hierarchy
  cachedGemini3Models = PREFERRED_GEMINI_3_PRIORITY;
  cacheTimestamp = now;
  return cachedGemini3Models;
}

interface ImageAnalysisRequestBody {
  readonly imageBase64: string;
  readonly mimeType?: string;
}

/**
 * POST /api/analyze-image-depth
 * Multimodal image decomposition and depth analysis using Gemini 3.8 Flash.
 */
app.post('/api/analyze-image-depth', async (req: Request<{}, {}, ImageAnalysisRequestBody>, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Image base64 manquante dans la requête.' });
      return;
    }

    // Clean up base64 string if it contains data URI prefix
    let cleanBase64 = imageBase64;
    let detectedMime = mimeType;
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      const header = parts[0];
      cleanBase64 = parts[1];
      if (header.includes(':')) {
        detectedMime = header.split(':')[1] || mimeType;
      }
    }

    if (!apiKey) {
      res.status(500).json({
        error: 'Clé API GEMINI_API_KEY non configurée sur le serveur. Veuillez vérifier vos secrets.',
      });
      return;
    }

    // Étape 1 : Analyse multimodale VFX (Gemini Flash / Gemini 3+)
    const systemPrompt = `Tu es un superviseur VFX expert en parallaxe 2.5D.
Analyse l'image fournie et divise-la en 2 ou 3 calques ordonnés de l'arrière vers l'avant.

Consignes pour les editPrompt :
- zIndex 1 (fond / background) : instruction précise en anglais pour supprimer les sujets du premier plan et reconstituer le décor masqué à l'identique (clean plate / inpainting).
- zIndex > 1 (sujet / foreground) : instruction précise en anglais pour isoler le sujet intact et remplacer tout le reste par un fond blanc uni (#FFFFFF).

Pour chaque calque :
- Assigne un identifiant id court ('bg_plate', 'subject_layer', etc.).
- Assigne un nom lisible en français.
- Assigne un rôle ('background' pour zIndex 1, 'subject' ou 'foreground' pour zIndex > 1).
- Assigne un zIndex croissant (1 pour le fond, 2 pour le sujet principal, 3 pour l'avant-plan immédiat).
- Assigne un depthFactor réaliste (ex: 0.2 pour le fond, 1.0 pour le sujet principal, 1.4 pour l'avant-plan).
- Rédige l'editPrompt adapté.

Recommande également le meilleur mouvement de caméra cinématographique pour sublimer la composition ('pan', 'tilt', 'dolly-in', 'dolly-out', 'tracking-lateral', 'boom-pedestal', 'zoom-in', 'dolly-zoom', 'roll-dutch').

Réponds STRICTEMENT sous forme de JSON valide conforme au schéma.`;

    const userPrompt = `Analyse cette image pour une décomposition 2.5D en calques ordonnés de l'arrière vers l'avant avec prompts d'édition ciblés (clean plate inpainting et détourage sur fond blanc).`;

    // Dynamically retrieve available Gemini 3+ models via the API in prioritized fallback order
    const candidateModels = await resolveGemini3Models(ai);

    let rawJson: string | null = null;
    let successfulModel = '';
    const failureLog: Array<{ model: string; message: string }> = [];

    for (const candidateModel of candidateModels) {
      try {
        console.log(`[CinéMotion Studio 2.5D] Tentative d'analyse de scène avec le modèle : ${candidateModel}...`);
        const response = await ai.models.generateContent({
          model: candidateModel,
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: detectedMime,
                },
              },
              {
                text: userPrompt,
              },
            ],
          },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                totalLayers: {
                  type: Type.INTEGER,
                  description: 'Nombre total de calques (généralement 2 ou 3)',
                },
                sceneDescription: {
                  type: Type.STRING,
                  description: 'Description globale de la scène et ambiance en français',
                },
                compositionType: {
                  type: Type.STRING,
                  description: 'Type de composition visuelle (portrait, duo, groupe, rue, paysage, intérieur)',
                },
                recommendedMovementId: {
                  type: Type.STRING,
                  description: "Identifiant du mouvement recommandé ('dolly-in', 'tracking-lateral', 'dolly-zoom', etc.)",
                },
                cinematicAdvice: {
                  type: Type.STRING,
                  description: 'Conseil cinématographique pour exploiter la profondeur de cette image',
                },
                layers: {
                  type: Type.ARRAY,
                  description: "Calques ordonnés de l'arrière (fond) vers l'avant (sujets)",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: {
                        type: Type.STRING,
                        description: "Identifiant unique (ex: 'bg_plate', 'subject_layer')",
                      },
                      name: {
                        type: Type.STRING,
                        description: 'Nom du calque en français',
                      },
                      role: {
                        type: Type.STRING,
                        description: "Rôle scénique: 'background', 'foreground', 'subject' ou 'midground'",
                      },
                      zIndex: {
                        type: Type.INTEGER,
                        description: 'Ordre d’empilement (1 pour le fond, 2 pour le sujet, etc.)',
                      },
                      depthFactor: {
                        type: Type.NUMBER,
                        description: 'Multiplicateur de déplacement (0.2 pour fond, 1.0 pour sujet, 1.4 pour premier plan)',
                      },
                      editPrompt: {
                        type: Type.STRING,
                        description: "Instruction d'édition d'image ciblée (inpainting fond ou isolation sur blanc #FFFFFF)",
                      },
                    },
                    required: ['id', 'name', 'role', 'zIndex', 'depthFactor', 'editPrompt'],
                  },
                },
              },
              required: [
                'totalLayers',
                'sceneDescription',
                'compositionType',
                'recommendedMovementId',
                'cinematicAdvice',
                'layers',
              ],
            },
          },
        });

        if (response.text) {
          rawJson = response.text;
          successfulModel = candidateModel;
          console.log(`[CinéMotion Studio 2.5D] Analyse réussie avec succès via le modèle : ${candidateModel}`);
          break;
        }
      } catch (candidateError) {
        const message = candidateError instanceof Error ? candidateError.message : String(candidateError);
        console.warn(`[CinéMotion Studio 2.5D] Échec avec le modèle ${candidateModel} : ${message}. Bascule vers le modèle de secours...`);
        failureLog.push({ model: candidateModel, message });
      }
    }

    if (!rawJson || !successfulModel) {
      const details = failureLog.map((f) => `${f.model} (${f.message})`).join(' | ');
      throw new Error(`Tous les modèles IA de secours ont échoué. Détails des tentatives : ${details}`);
    }

    interface RawLayerOutput {
      readonly id: string;
      readonly name: string;
      readonly role: 'background' | 'foreground' | 'subject' | 'midground';
      readonly zIndex: number;
      readonly depthFactor: number;
      readonly editPrompt: string;
    }

    interface ParsedAiOutput {
      readonly totalLayers: number;
      readonly sceneDescription: string;
      readonly compositionType: string;
      readonly recommendedMovementId: string;
      readonly cinematicAdvice: string;
      readonly layers: readonly RawLayerOutput[];
    }

    const parsedData: ParsedAiOutput = JSON.parse(rawJson);

    // Étape 2 : Édition & génération des plaques de calques (Gemini Image)
    // Tente de générer les calques d'édition (clean plate et détourage sur blanc) si le modèle image est disponible
    const enrichedLayers = await Promise.all(
      parsedData.layers.map(async (layer) => {
        let plateDataUrl: string | null = null;
        try {
          console.log(`[CinéMotion Studio 2.5D] Traitement de la plaque pour le calque '${layer.id}'...`);
          const imgGenResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: detectedMime,
                  },
                },
                {
                  text: layer.editPrompt,
                },
              ],
            },
          });

          const parts = imgGenResponse.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              plateDataUrl = `data:${mime};base64,${part.inlineData.data}`;
              console.log(`[CinéMotion Studio 2.5D] Plaque générée avec succès pour le calque '${layer.id}'`);
              break;
            }
          }
        } catch (imgError) {
          const errMessage = imgError instanceof Error ? imgError.message : String(imgError);
          console.info(
            `[CinéMotion Studio 2.5D] Édition d'image IA non activée ou quota libre sur la clé pour le calque '${layer.id}' (${errMessage.slice(0, 100)}). Utilisation du moteur de détourage de plaque haute précision.`
          );
        }

        return {
          ...layer,
          plateDataUrl,
        };
      })
    );

    res.json({
      totalLayers: parsedData.totalLayers || enrichedLayers.length,
      sceneDescription: parsedData.sceneDescription,
      compositionType: parsedData.compositionType,
      recommendedMovementId: parsedData.recommendedMovementId,
      cinematicAdvice: parsedData.cinematicAdvice,
      layers: enrichedLayers,
      usedModel: successfulModel,
    });
  } catch (error) {
    console.error('Erreur lors de l’analyse Gemini Image Depth:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({
      error: `Échec de l’analyse d'image par l’IA Gemini: ${errorMessage}`,
    });
  }
});

// Health check endpoint for Cloud Run and container orchestration
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// Production static file serving vs Vite dev middleware
const distIndexPath = path.resolve(__dirname, 'dist', 'index.html');
const isProduction =
  process.env.NODE_ENV === 'production' ||
  (process.env.NODE_ENV !== 'development' && fs.existsSync(distIndexPath));

if (isProduction) {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(distIndexPath);
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CinéMotion] Serveur plein stack actif sur http://0.0.0.0:${PORT}`);
});
