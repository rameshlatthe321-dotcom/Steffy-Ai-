export interface VoskWordResult {
  conf: number;
  start: number;
  end: number;
  word: string;
}

export interface VoskResultPayload {
  text: string;
  result?: VoskWordResult[];
}

export interface VoskPartialPayload {
  partial: string;
}

export interface VoskSpeechState {
  isInitialized: boolean;
  isListening: boolean;
  modelName: string;
  modelSize: string;
  sampleRate: number;
  lastPartialText: string;
  lastFinalText: string;
  confidence: number;
  latencyMs: number;
}

/**
 * Parses raw JSON output from Vosk Android/C++ speech recognizer
 * Vosk emits `{"text": "transcribed speech"}` on final result,
 * or `{"partial": "transcribed words so far"}` on partial result.
 */
export function parseVoskResult(rawJson: string): { text: string; confidence: number; words: VoskWordResult[] } {
  try {
    const parsed: VoskResultPayload = JSON.parse(rawJson);
    const text = (parsed.text || '').trim();

    if (!parsed.result || parsed.result.length === 0) {
      return {
        text,
        confidence: text ? 0.92 : 0,
        words: []
      };
    }

    // Average confidence across all recognized words
    const avgConf =
      parsed.result.reduce((acc, curr) => acc + (curr.conf || 0.9), 0) / parsed.result.length;

    return {
      text,
      confidence: Math.round(avgConf * 100) / 100,
      words: parsed.result
    };
  } catch {
    // If not valid JSON, fallback to plain text
    return {
      text: rawJson.trim(),
      confidence: 0.8,
      words: []
    };
  }
}

/**
 * Parses partial recognition result string from Vosk
 */
export function parseVoskPartialResult(rawJson: string): string {
  try {
    const parsed: VoskPartialPayload = JSON.parse(rawJson);
    return (parsed.partial || '').trim();
  } catch {
    return rawJson.trim();
  }
}

/**
 * Generates Vosk-compatible formatted JSON result
 */
export function createVoskResultJson(text: string, confidence = 0.96): string {
  const words = text.split(/\s+/).filter(Boolean);
  let currentTime = 0.2;

  const resultWords: VoskWordResult[] = words.map((w) => {
    const duration = 0.3 + w.length * 0.05;
    const start = Math.round(currentTime * 100) / 100;
    const end = Math.round((currentTime + duration) * 100) / 100;
    currentTime = end + 0.1;

    return {
      word: w.toLowerCase(),
      conf: confidence,
      start,
      end
    };
  });

  return JSON.stringify({
    text: text.toLowerCase().trim(),
    result: resultWords
  });
}
