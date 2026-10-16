import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Cpu,
  Layers,
  Radio,
  FileCode,
  CheckCircle2,
  Play,
  Volume2,
  Sparkles,
  Activity
} from 'lucide-react';
import { createVoskResultJson, parseVoskResult, VoskWordResult } from '../utils/voskEngine.ts';

interface VoskVisualizerProps {
  isListening: boolean;
  onToggleListening: () => void;
  onTranscribeResult: (text: string, rawJson: string) => void;
  partialText: string;
}

export const VoskVisualizer: React.FC<VoskVisualizerProps> = ({
  isListening,
  onToggleListening,
  onTranscribeResult,
  partialText
}) => {
  const [activeJsonPayload, setActiveJsonPayload] = useState<string>(
    createVoskResultJson('call mom', 0.98)
  );
  const [simulatedWords, setSimulatedWords] = useState<VoskWordResult[]>([
    { word: 'call', conf: 0.99, start: 0.2, end: 0.6 },
    { word: 'mom', conf: 0.97, start: 0.7, end: 1.1 }
  ]);

  const presetUtterances = [
    { label: 'call mom', text: 'call mom' },
    { label: 'text john saying running late', text: 'text john saying running late' },
    { label: 'open youtube', text: 'open youtube' },
    { label: 'click "Subscribe"', text: 'click "Subscribe"' },
    { label: 'swipe down', text: 'swipe down' },
    { label: 'turn on flashlight', text: 'turn on flashlight' },
    { label: 'what is my battery level', text: 'what is my battery level' }
  ];

  const handleSimulateVoskAudio = (utteranceText: string) => {
    const json = createVoskResultJson(utteranceText, 0.96);
    setActiveJsonPayload(json);
    const parsed = parseVoskResult(json);
    setSimulatedWords(parsed.words);
    onTranscribeResult(parsed.text, json);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col h-full overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-950 text-teal-400 border border-teal-800">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>Vosk Offline Speech Recognizer</span>
              <span className="text-[9px] bg-teal-950 text-teal-400 font-mono px-2 py-0.5 rounded border border-teal-800">
                vosk-model-small-en-us
              </span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Offline Acoustic Decoding • 16 kHz PCM • 0 Cloud Latency
            </span>
          </div>
        </div>

        {/* Live Mic Action */}
        <button
          onClick={onToggleListening}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isListening
              ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-lg shadow-red-500/30'
              : 'bg-teal-950 text-teal-300 border-teal-800 hover:bg-teal-900'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>Listening...</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>Start Vosk Mic</span>
            </>
          )}
        </button>
      </div>

      {/* Acoustic Frequency Visualization */}
      <div className="my-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Acoustic Audio Stream (PCM 16-bit 16000 Hz)</span>
          </span>
          <span className="font-mono text-[10px] text-teal-400">
            {isListening ? 'STREAMING AUDIO' : 'STANDBY'}
          </span>
        </div>

        {/* Sound bar spectrum */}
        <div className="flex items-center justify-center gap-1.5 h-10 bg-slate-900/60 rounded-lg p-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isListening
                  ? 'bg-gradient-to-t from-teal-500 to-emerald-300'
                  : 'bg-slate-800 h-2'
              }`}
              style={{
                height: isListening ? `${Math.max(15, Math.sin((i + Date.now() / 200) * 0.8) * 90)}%` : '8px'
              }}
            />
          ))}
        </div>

        {/* Streaming Partial Words */}
        {partialText && (
          <div className="text-[11px] font-mono text-teal-300 bg-teal-950/40 p-2 rounded border border-teal-800/60 animate-pulse">
            <span className="text-slate-500 mr-2">Vosk partial:</span>
            "{partialText}..."
          </div>
        )}
      </div>

      {/* Preset Speech Utterance Simulator */}
      <div className="mb-3 space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Simulate Vosk Acoustic Audio Ingestion
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presetUtterances.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSimulateVoskAudio(item.text)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
            >
              <Play className="w-2.5 h-2.5 text-teal-400" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Raw Vosk JSON & Word Confidence Matrix */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-950/70 rounded-xl border border-slate-800 p-2.5 overflow-hidden">
        <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1.5 border-b border-slate-800/80">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <FileCode className="w-3 h-3 text-teal-400" />
            <span>Vosk JSON Output & Word Confidence</span>
          </span>
          <span className="font-mono text-teal-400">org.vosk.Recognizer.getResult()</span>
        </div>

        {/* Word Confidence Pills */}
        <div className="flex flex-wrap gap-1.5 my-2">
          {simulatedWords.map((w, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-950/80 border border-teal-800 text-[10px] font-mono text-teal-200"
            >
              <span className="font-bold">{w.word}</span>
              <span className="text-[9px] text-teal-400 opacity-80">
                {Math.round(w.conf * 100)}% ({w.start}s - {w.end}s)
              </span>
            </div>
          ))}
        </div>

        {/* Raw JSON Pre */}
        <div className="flex-1 overflow-auto bg-slate-950 p-2 rounded font-mono text-[10px] text-teal-300/90 leading-tight">
          <pre className="whitespace-pre-wrap">{activeJsonPayload}</pre>
        </div>
      </div>
    </div>
  );
};
