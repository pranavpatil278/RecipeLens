import { GoogleGenAI } from '@google/genai';

export interface ApiRequest {
  method?: string;
  body?: unknown;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function generateGeminiJson(
  prompt: string,
  image?: { mimeType: string; data: string },
): Promise<Record<string, unknown>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ApiError(503, 'Gemini is not configured on this deployment.');

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        ...(image ? [{ inlineData: { mimeType: image.mimeType, data: image.data } }] : []),
      ],
    }],
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text?.trim();
  if (!text) throw new ApiError(502, 'Gemini returned no result. Please try again.');

  try {
    const parsed: unknown = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected a JSON object.');
    return parsed as Record<string, unknown>;
  } catch {
    throw new ApiError(502, 'Gemini returned an invalid result. Please try again.');
  }
}

export function sendError(response: ApiResponse, error: unknown, fallback: string): void {
  const knownError = error instanceof ApiError;
  response.status(knownError ? error.statusCode : 502).json({
    error: knownError ? error.message : fallback,
  });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function numberValue(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}