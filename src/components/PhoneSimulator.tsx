import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  BatteryCharging,
  Zap,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Circle,
  Square,
  X,
  Phone,
  MessageCircle,
  PlaySquare,
  Camera,
  Settings as SettingsIcon,
  Folder,
  Sliders,
  Moon,
  Bluetooth,
  Flame
} from 'lucide-react';
import type { DeviceState, Contact, ParsedIntent } from '../types/assistant.ts';
import { SteffyComposeView } from './SteffyComposeView.tsx';
import { SimulatedApps } from './SimulatedApps.tsx';

interface PhoneSimulatorProps {
  deviceState: DeviceState;
  contacts: Contact[];
  lastParsedIntent: ParsedIntent | null;
  assistantResponse: string;
  isSpeaking: boolean;
  isSpeechEnabled: boolean;
  gestureTrail: { startX: number; startY: number; endX: number; endY: number; active: boolean } | null;
  clickRipple: { x: number; y: number; active: boolean; label?: string } | null;
  onCommandSubmitted: (command: string) => void;
  onOpenApp: (appName: string) => void;
  onToggleSpeech: () => void;
  onToggleFlashlight: () => void;
  onToggleWifi: () => void;
  onTogglePermission: (perm: keyof DeviceState['grantedPermissions']) => void;
  onToggleAccessibility: () => void;
  onSelectSafFile: (file: { name: string; size: string; type: string; content: string }) => void;
  onPerformClickText: (text: string) => void;
  onEndCall: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  deviceState,
  contacts,
  lastParsedIntent,
  assistantResponse,
  isSpeaking,
  isSpeechEnabled,
  gestureTrail,
  clickRipple,
  onCommandSubmitted,
  onOpenApp,
  onToggleSpeech,
  onToggleFlashlight,
  onToggleWifi,
  onTogglePermission,
  onToggleAccessibility,
  onSelectSafFile,
  onPerformClickText,
  onEndCall,
}) => {
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [recentsOpen, setRecentsOpen] = useState(false);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavHome = () => {
    setRecentsOpen(false);
    onOpenApp('steffy');
  };

  const handleNavBack = () => {
    if (quickSettingsOpen) {
      setQuickSettingsOpen(false);
    } else if (recentsOpen) {
      setRecentsOpen(false);
    } else if (deviceState.currentScreenApp !== 'steffy') {
      onOpenApp('steffy');
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[390px] h-[780px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 flex flex-col justify-between overflow-hidden select-none">
      {/* Device Side Buttons (Visual aesthetic) */}
      <div className="absolute -left-[7px] top-24 w-[3px] h-12 bg-slate-600 rounded-l-md" />
      <div className="absolute -left-[7px] top-40 w-[3px] h-12 bg-slate-600 rounded-l-md" />
      <div className="absolute -right-[7px] top-32 w-[3px] h-16 bg-slate-600 rounded-r-md" />

      {/* Screen Container */}
      <div className="relative flex-1 bg-slate-950 rounded-[38px] overflow-hidden flex flex-col shadow-inner border border-slate-800">
        {/* Android Status Bar */}
        <div
          onClick={() => setQuickSettingsOpen(!quickSettingsOpen)}
          className="h-9 px-5 pt-1 bg-slate-950 flex items-center justify-between text-xs text-slate-300 z-30 cursor-pointer hover:bg-slate-900 transition-colors"
        >
          {/* Left: Clock */}
          <span className="font-semibold text-xs text-slate-200 tracking-tight font-mono">
            {currentTime || '09:41'}
          </span>

          {/* Center: Camera Punchhole */}
          <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-950" />
          </div>

          {/* Right: Hardware Icons */}
          <div className="flex items-center gap-2 text-slate-400">
            {deviceState.flashlight && <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
            {deviceState.wifiEnabled ? (
              <Wifi className="w-3.5 h-3.5 text-slate-200" />
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">LTE</span>
            )}
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono text-slate-300">{deviceState.battery}%</span>
              <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            </div>
          </div>
        </div>

        {/* Quick Settings Drawer (Pull-Down) */}
        {quickSettingsOpen && (
          <div className="absolute inset-x-0 top-0 pt-10 pb-6 px-4 bg-slate-900/98 backdrop-blur-xl border-b border-slate-700 z-40 animate-in slide-in-from-top duration-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-bold text-slate-200">Android Quick Settings</span>
              <button
                onClick={() => setQuickSettingsOpen(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 my-4 text-center">
              {/* Wi-Fi toggle */}
              <button
                onClick={onToggleWifi}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-colors ${
                  deviceState.wifiEnabled
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Wifi className="w-4 h-4" />
                <span className="text-[9px] font-medium">Wi-Fi</span>
              </button>

              {/* Flashlight toggle */}
              <button
                onClick={onToggleFlashlight}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-colors ${
                  deviceState.flashlight
                    ? 'bg-amber-950/80 border-amber-600 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="text-[9px] font-medium">Flashlight</span>
              </button>

              {/* Bluetooth toggle */}
              <button
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border ${
                  deviceState.bluetoothEnabled
                    ? 'bg-blue-950/80 border-blue-700 text-blue-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Bluetooth className="w-4 h-4" />
                <span className="text-[9px] font-medium">Bluetooth</span>
              </button>

              {/* TTS Speech Mute Toggle */}
              <button
                onClick={onToggleSpeech}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border ${
                  isSpeechEnabled
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="text-[9px] font-medium">TTS Voice</span>
              </button>
            </div>

            {/* Quick App Shortcuts */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold mb-2 block">LAUNCH TEST APP</span>
              <div className="flex gap-2 justify-between">
                {[
                  { id: 'steffy', name: 'Steffy', icon: Sparkles, color: 'text-emerald-400' },
                  { id: 'youtube', name: 'YouTube', icon: PlaySquare, color: 'text-red-500' },
                  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
                  { id: 'dialer', name: 'Phone', icon: Phone, color: 'text-blue-400' },
                  { id: 'files', name: 'Files (SAF)', icon: Folder, color: 'text-amber-400' },
                  { id: 'settings', name: 'Settings', icon: SettingsIcon, color: 'text-slate-400' }
                ].map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      onOpenApp(app.id);
                      setQuickSettingsOpen(false);
                    }}
                    className="flex flex-col items-center gap-1 p-1 hover:bg-slate-800 rounded-lg"
                  >
                    <app.icon className={`w-4 h-4 ${app.color}`} />
                    <span className="text-[9px] text-slate-300">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ongoing Active Call Floating Banner */}
        {deviceState.activeCall && deviceState.currentScreenApp !== 'dialer' && (
          <div
            onClick={() => onOpenApp('dialer')}
            className="bg-emerald-600 px-3 py-1.5 text-xs text-white flex items-center justify-between cursor-pointer shadow-md z-20 animate-pulse"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              <span className="font-semibold truncate">
                Call with {deviceState.activeCall.contactName || deviceState.activeCall.phoneNumber}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEndCall();
              }}
              className="px-2 py-0.5 rounded bg-red-700 text-[10px] font-bold hover:bg-red-800"
            >
              End
            </button>
          </div>
        )}

        {/* Screen Display Area */}
        <div className="relative flex-1 overflow-hidden">
          {deviceState.currentScreenApp === 'steffy' ? (
            <SteffyComposeView
              assistantResponse={assistantResponse}
              isSpeaking={isSpeaking}
              lastParsedIntent={lastParsedIntent}
              onCommandSubmitted={onCommandSubmitted}
              onOpenSaf={() => onOpenApp('files')}
              onToggleSpeech={onToggleSpeech}
              isSpeechEnabled={isSpeechEnabled}
            />
          ) : (
            <SimulatedApps
              currentApp={deviceState.currentScreenApp}
              deviceState={deviceState}
              contacts={contacts}
              onOpenApp={onOpenApp}
              onTogglePermission={onTogglePermission}
              onToggleAccessibility={onToggleAccessibility}
              onSelectSafFile={onSelectSafFile}
              onPerformClickText={onPerformClickText}
              onEndCall={onEndCall}
            />
          )}

          {/* Recents Multitasking Overlay */}
          {recentsOpen && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md p-4 z-30 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 mb-3">Recent Applications</h3>
                <div className="space-y-2">
                  {[
                    { id: 'steffy', label: 'Steffy Assistant' },
                    { id: 'youtube', label: 'YouTube' },
                    { id: 'whatsapp', label: 'WhatsApp' },
                    { id: 'files', label: 'Files (SAF)' },
                    { id: 'settings', label: 'Settings' }
                  ].map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        onOpenApp(app.id);
                        setRecentsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 cursor-pointer flex items-center justify-between text-xs text-slate-200"
                    >
                      <span>{app.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Running</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setRecentsOpen(false)}
                className="w-full py-2 bg-slate-800 text-xs text-slate-300 rounded-xl"
              >
                Close Recents
              </button>
            </div>
          )}

          {/* Programmatic Accessibility Swipe Trail Overlay */}
          {gestureTrail?.active && (
            <div className="absolute inset-0 pointer-events-none z-50">
              <svg className="w-full h-full">
                <line
                  x1={gestureTrail.startX}
                  y1={gestureTrail.startY}
                  x2={gestureTrail.endX}
                  y2={gestureTrail.endY}
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </svg>
              <div
                className="absolute w-8 h-8 rounded-full bg-emerald-400/80 border-2 border-white shadow-lg animate-ping"
                style={{ left: gestureTrail.startX - 16, top: gestureTrail.startY - 16 }}
              />
            </div>
          )}

          {/* Programmatic Accessibility Click Ripple Overlay */}
          {clickRipple?.active && (
            <div
              className="absolute z-50 pointer-events-none flex flex-col items-center"
              style={{ left: clickRipple.x - 20, top: clickRipple.y - 20 }}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/50 border-2 border-emerald-300 animate-ping" />
              {clickRipple.label && (
                <span className="mt-1 bg-emerald-950 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-700 shadow">
                  Auto-Click: "{clickRipple.label}"
                </span>
              )}
            </div>
          )}
        </div>

        {/* Android Navigation Bar (3-Button Layout) */}
        <div className="h-11 bg-slate-950 px-10 flex items-center justify-between border-t border-slate-900 z-30">
          {/* Back button */}
          <button
            onClick={handleNavBack}
            aria-label="Back"
            className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Home button */}
          <button
            onClick={handleNavHome}
            aria-label="Home"
            className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform"
          >
            <Circle className="w-4 h-4 fill-slate-400 hover:fill-white" />
          </button>

          {/* Recents button */}
          <button
            onClick={() => setRecentsOpen(!recentsOpen)}
            aria-label="Recents"
            className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
