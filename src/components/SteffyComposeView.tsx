import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  FolderOpen,
  CheckCircle,
  HelpCircle,
  Phone,
  MessageSquare,
  PlaySquare,
  Hand,
  Lightbulb
} from 'lucide-react';
import type { ParsedIntent } from '../types/assistant.ts';

interface SteffyComposeViewProps {
  assistantResponse: string;
  isSpeaking: boolean;
  lastParsedIntent: ParsedIntent | null;
  onCommandSubmitted: (command: string) => void;
  onOpenSaf: () => void;
  onToggleSpeech: () => void;
  isSpeechEnabled: boolean;
}

export const SteffyComposeView: React.FC<SteffyComposeViewProps> = ({
  assistantResponse,
  isSpeaking,
  lastParsedIntent,
  onCommandSubmitted,
  onOpenSaf,
  onToggleSpeech,
  isSpeechEnabled
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Setup Web Speech Recognition for offline/browser voice input
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          onCommandSubmitted(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setSpeechError(`Mic: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onCommandSubmitted]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition not supported in this browser. Please type.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputText.trim()) {
      onCommandSubmitted(inputText.trim());
      setInputText('');
    }
  };

  const sampleCommands = [
    { label: 'Call Mom', icon: Phone, cmd: 'call mom' },
    { label: 'Text John saying hello', icon: MessageSquare, cmd: 'text John saying hello from Steffy' },
    { label: 'Open YouTube', icon: PlaySquare, cmd: 'open youtube' },
    { label: 'Click "Subscribe"', icon: Hand, cmd: 'click "Subscribe"' },
    { label: 'Swipe Down', icon: Hand, cmd: 'swipe down' },
    { label: 'Turn on flashlight', icon: Lightbulb, cmd: 'turn on flashlight' },
    { label: 'Battery status', icon: Sparkles, cmd: 'what is my battery level' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 select-none">
      {/* Top Header matching Jetpack Compose Row */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 leading-tight">Steffy Assistant</h1>
            <span className="text-[10px] text-teal-400 font-medium">Vosk Offline ASR • Jetpack Compose</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* TTS Audio toggle button */}
          <button
            onClick={onToggleSpeech}
            title={isSpeechEnabled ? 'Text-to-Speech active' : 'Text-to-Speech muted'}
            aria-label={isSpeechEnabled ? 'Mute Speech' : 'Enable Speech'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSpeechEnabled
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {isSpeechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* AssistChip: Open Files (SAF) */}
          <button
            onClick={onOpenSaf}
            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors shadow-sm"
          >
            <FolderOpen className="w-3 h-3 text-amber-400" />
            <span>Files (SAF)</span>
          </button>
        </div>
      </div>

      {/* Main Response Card - faithful to Jetpack Compose Card(modifier = Modifier.weight(1f)) */}
      <div className="flex-1 my-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800/80 p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
        {/* Ambient glow when speaking */}
        {isSpeaking && (
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none animate-pulse" />
        )}

        {/* Intent recognition badge */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
              {lastParsedIntent ? `Intent: ${lastParsedIntent.type}` : 'Standby • Ready'}
            </span>
          </div>
          {lastParsedIntent && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
              Confidence {Math.round(lastParsedIntent.confidence * 100)}%
            </span>
          )}
        </div>

        {/* Spoken Response text */}
        <div className="my-auto py-4 text-center z-10 space-y-4">
          <p className="text-base font-medium text-slate-100 leading-relaxed max-w-md mx-auto">
            {assistantResponse}
          </p>

          {/* Voice soundwaves visualization */}
          <div className="flex items-center justify-center gap-1 h-8">
            <div
              className={`w-1 rounded-full bg-emerald-400 transition-all duration-200 ${
                isSpeaking ? 'h-6 animate-soundwave-1' : isListening ? 'h-4 animate-bounce' : 'h-1.5 opacity-30'
              }`}
            />
            <div
              className={`w-1 rounded-full bg-teal-400 transition-all duration-200 ${
                isSpeaking ? 'h-8 animate-soundwave-2' : isListening ? 'h-7 animate-bounce' : 'h-1.5 opacity-30'
              }`}
            />
            <div
              className={`w-1 rounded-full bg-emerald-300 transition-all duration-200 ${
                isSpeaking ? 'h-5 animate-soundwave-3' : isListening ? 'h-5 animate-bounce' : 'h-1.5 opacity-30'
              }`}
            />
            <div
              className={`w-1 rounded-full bg-cyan-400 transition-all duration-200 ${
                isSpeaking ? 'h-7 animate-soundwave-4' : isListening ? 'h-6 animate-bounce' : 'h-1.5 opacity-30'
              }`}
            />
            <div
              className={`w-1 rounded-full bg-emerald-400 transition-all duration-200 ${
                isSpeaking ? 'h-4 animate-soundwave-5' : isListening ? 'h-3 animate-bounce' : 'h-1.5 opacity-30'
              }`}
            />
          </div>

          {isListening && (
            <p className="text-xs text-emerald-400 font-medium animate-pulse">
              Listening to voice... Speak now
            </p>
          )}

          {speechError && (
            <p className="text-[11px] text-amber-400 bg-amber-950/50 py-1 px-3 rounded-full inline-block">
              {speechError}
            </p>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="z-10">
          <div className="text-[10px] text-slate-400 mb-1.5 font-medium flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            <span>Try asking Steffy:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1">
            {sampleCommands.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onCommandSubmitted(item.cmd)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
              >
                <item.icon className="w-3 h-3 text-emerald-400" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Bar - faithful to Jetpack Compose OutlinedTextField + Button */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Steffy (e.g. 'call mom', 'open youtube')..."
            className="w-full bg-slate-900 text-xs text-slate-100 rounded-xl px-3.5 py-3 pr-10 border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-500"
          />
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Voice Dictation Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? 'Stop listening' : 'Start voice dictation'}
          className={`p-3 rounded-xl border transition-all ${
            isListening
              ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-lg shadow-red-500/30'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          aria-label="Send command"
          className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
          disabled={!inputText.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
