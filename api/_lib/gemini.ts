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

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  if (image) parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    },
  );

  if (!response.ok) {
    throw new ApiError(502, `Gemini request failed with HTTP ${response.status}.`);
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
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