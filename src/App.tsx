import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Layers,
  Code2,
  Terminal,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  ShieldCheck,
  Zap,
  Info,
  Phone,
  MessageCircle,
  PlaySquare,
  HelpCircle,
  ExternalLink,
  Cpu,
  Mic,
  Activity
} from 'lucide-react';
import type {
  DeviceState,
  Contact,
  ParsedIntent,
  LogEntry
} from './types/assistant.ts';
import {
  parseUserCommand,
  DEFAULT_CONTACTS,
  INSTALLED_APPS
} from './utils/intentEngine.ts';
import { parseVoskResult } from './utils/voskEngine.ts';
import { PhoneSimulator } from './components/PhoneSimulator.tsx';
import { AccessibilityInspector } from './components/AccessibilityInspector.tsx';
import { ProjectCodeViewer } from './components/ProjectCodeViewer.tsx';
import { SystemLogcat } from './components/SystemLogcat.tsx';
import { VoskVisualizer } from './components/VoskVisualizer.tsx';
import { ApkBuilderView } from './components/ApkBuilderView.tsx';
import { downloadAndroidProjectZip, downloadSteffyApkPackage } from './utils/exportProject.ts';

export default function App() {
  // Navigation tabs: 'phone' | 'vosk' | 'inspector' | 'apk' | 'code'
  const [activeTab, setActiveTab] = useState<'phone' | 'vosk' | 'inspector' | 'apk' | 'code'>('phone');
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Assistant State
  const [assistantResponse, setAssistantResponse] = useState<string>(
    "Hello! I am Steffy, powered by offline Vosk speech recognition. Speak or type a command like 'call Mom', 'text John saying hello', or 'open YouTube'."
  );
  const [lastParsedIntent, setLastParsedIntent] = useState<ParsedIntent | null>(null);

  // Vosk ASR State
  const [isVoskListening, setIsVoskListening] = useState(false);
  const [voskPartialText, setVoskPartialText] = useState('');
  const recognitionRef = useRef<any>(null);

  // Device & OS State
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_CONTACTS);
  const [deviceState, setDeviceState] = useState<DeviceState>({
    battery: 88,
    isCharging: false,
    wifiEnabled: true,
    bluetoothEnabled: true,
    flashlight: false,
    volume: 80,
    brightness: 85,
    airplaneMode: false,
    activeCall: null,
    accessibilityServiceEnabled: true,
    grantedPermissions: {
      CALL_PHONE: true,
      SEND_SMS: true,
      READ_CONTACTS: true,
      RECORD_AUDIO: true,
      ACCESSIBILITY: true
    },
    openSafFile: null,
    currentScreenApp: 'steffy'
  });

  // Visual gesture & touch feedback
  const [gestureTrail, setGestureTrail] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    active: boolean;
  } | null>(null);

  const [clickRipple, setClickRipple] = useState<{
    x: number;
    y: number;
    active: boolean;
    label?: string;
  } | null>(null);

  // System Logcat stream
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'SYSTEM',
      level: 'info',
      message: 'SteffyAssistant process started (PID 10842, UID 10188)'
    },
    {
      id: 'log-init-vosk',
      timestamp: new Date().toLocaleTimeString(),
      type: 'SYSTEM',
      level: 'success',
      message: 'VoskSpeechService: Loaded model-en-us (42MB) into memory offline. Sample rate: 16000Hz'
    },
    {
      id: 'log-init-2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'ACCESSIBILITY',
      level: 'success',
      message: 'SteffyAccessibilityService bound: flags=flagDefault|flagReportViewIds, canPerformGestures=true'
    },
    {
      id: 'log-init-3',
      timestamp: new Date().toLocaleTimeString(),
      type: 'INTENT',
      level: 'info',
      message: 'Offline IntentRouter initialized with 9 system apps and 5 contacts'
    }
  ]);

  const addLog = (
    type: LogEntry['type'],
    level: LogEntry['level'],
    message: string,
    metadata?: Record<string, any>
  ) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      level,
      message,
      metadata
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Setup Web Speech Recognition for Vosk microphone bridge in browser
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim();
            setVoskPartialText('');
            if (transcript) {
              handleCommandSubmitted(transcript);
            }
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) {
          setVoskPartialText(interim);
        }
      };

      recognition.onerror = () => {
        setIsVoskListening(false);
      };

      recognition.onend = () => {
        setIsVoskListening(false);
        setVoskPartialText('');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoskListening = () => {
    if (!recognitionRef.current) {
      // Simulate live Vosk speech sample if browser mic is unavailable
      const sample = 'call mom';
      handleCommandSubmitted(sample);
      return;
    }

    if (isVoskListening) {
      recognitionRef.current.stop();
      setIsVoskListening(false);
      setVoskPartialText('');
      addLog('SYSTEM', 'info', 'VoskSpeechService: Audio recording stream stopped');
    } else {
      try {
        recognitionRef.current.start();
        setIsVoskListening(true);
        addLog('SYSTEM', 'action', 'VoskSpeechService: Audio stream started at 16000Hz (PCM 16-bit)');
      } catch (err) {
        console.warn('Speech recognition start error:', err);
      }
    }
  };

  // Active call timer interval
  useEffect(() => {
    let callTimer: NodeJS.Timeout | null = null;
    if (deviceState.activeCall && deviceState.activeCall.state === 'CONNECTED') {
      callTimer = setInterval(() => {
        setDeviceState((prev) => {
          if (!prev.activeCall) return prev;
          return {
            ...prev,
            activeCall: {
              ...prev.activeCall,
              duration: prev.activeCall.duration + 1
            }
          };
        });
      }, 1000);
    }
    return () => {
      if (callTimer) clearInterval(callTimer);
    };
  }, [deviceState.activeCall?.state]);

  // Offline Web Speech API synthesis
  const speakText = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not allowed or supported:', e);
      setIsSpeaking(false);
    }
  };

  // Main Command Processing Pipeline
  const handleCommandSubmitted = (command: string) => {
    addLog('INTENT', 'action', `Vosk transcribed speech: "${command}"`);

    // 1. Process with pure offline IntentRouter
    const parsed = parseUserCommand(command, contacts);
    setLastParsedIntent(parsed);
    setAssistantResponse(parsed.spokenResponse);
    speakText(parsed.spokenResponse);

    // 2. Dispatch system tasks based on parsed intent
    switch (parsed.type) {
      case 'CALL': {
        if (!deviceState.grantedPermissions.CALL_PHONE) {
          addLog('CALL', 'warn', 'SecurityException: CALL_PHONE permission denied in AndroidManifest');
          setAssistantResponse("Permission denied: android.permission.CALL_PHONE is required to place calls.");
          return;
        }

        const phone = parsed.details?.phoneNumber || '911';
        const contactName = parsed.details?.contactName;
        addLog('CALL', 'success', `Intent.ACTION_CALL dispatched to TelecomManager: tel:${phone}`, {
          contact: contactName,
          phoneNumber: phone
        });

        // Trigger active call UI
        setDeviceState((prev) => ({
          ...prev,
          activeCall: {
            phoneNumber: phone,
            contactName,
            duration: 0,
            isMuted: false,
            onSpeaker: true,
            state: 'CONNECTED'
          },
          currentScreenApp: 'dialer'
        }));
        break;
      }

      case 'SMS': {
        if (!deviceState.grantedPermissions.SEND_SMS) {
          addLog('SMS', 'warn', 'SecurityException: SEND_SMS permission denied');
          setAssistantResponse("Permission denied: android.permission.SEND_SMS is required to send messages.");
          return;
        }

        const phone = parsed.details?.phoneNumber || 'Unknown';
        const msg = parsed.details?.smsMessage || 'Hello';
        addLog('SMS', 'success', `SmsManager.sendTextMessage() dispatched to ${phone}: "${msg}"`, {
          recipient: phone,
          body: msg
        });
        break;
      }

      case 'LAUNCH_APP': {
        const pkg = parsed.details?.packageName || 'unknown';
        const appName = parsed.details?.appName || 'App';
        addLog('LAUNCH', 'action', `PackageManager.getLaunchIntentForPackage("${pkg}") dispatched`);

        const matched = INSTALLED_APPS.find(
          (a) => a.packageName === pkg || a.name.toLowerCase() === appName.toLowerCase()
        );

        if (matched) {
          const appScreenKey =
            matched.id === 'app_youtube'
              ? 'youtube'
              : matched.id === 'app_whatsapp'
              ? 'whatsapp'
              : matched.id === 'app_camera'
              ? 'camera'
              : matched.id === 'app_settings'
              ? 'settings'
              : matched.id === 'app_files'
              ? 'files'
              : matched.id === 'app_dialer'
              ? 'dialer'
              : 'steffy';

          setDeviceState((prev) => ({ ...prev, currentScreenApp: appScreenKey }));
        }
        break;
      }

      case 'ACCESSIBILITY_CLICK': {
        if (!deviceState.accessibilityServiceEnabled) {
          addLog('ACCESSIBILITY', 'warn', 'SteffyAccessibilityService is not enabled by user in Settings');
          setAssistantResponse("Accessibility Service is disabled. Please enable Steffy in Android Settings.");
          return;
        }

        const target = parsed.details?.clickTarget || '';
        addLog('ACCESSIBILITY', 'action', `Traversing AccessibilityNodeInfo for target text: "${target}"`);

        setClickRipple({ x: 260, y: 350, active: true, label: target });
        setTimeout(() => setClickRipple(null), 1400);

        if (target.toLowerCase().includes('subscribe')) {
          addLog('ACCESSIBILITY', 'success', `AccessibilityNodeInfo.performAction(ACTION_CLICK) on node [Subscribe] succeeded`);
        }
        break;
      }

      case 'ACCESSIBILITY_SWIPE': {
        if (!deviceState.accessibilityServiceEnabled) {
          addLog('ACCESSIBILITY', 'warn', 'Accessibility Service disabled');
          return;
        }

        const dir = parsed.details?.swipeDirection || 'DOWN';
        const coords =
          dir === 'DOWN'
            ? { startX: 195, startY: 200, endX: 195, endY: 550 }
            : dir === 'UP'
            ? { startX: 195, startY: 550, endX: 195, endY: 200 }
            : dir === 'LEFT'
            ? { startX: 300, startY: 400, endX: 80, endY: 400 }
            : { startX: 80, startY: 400, endX: 300, endY: 400 };

        addLog(
          'ACCESSIBILITY',
          'action',
          `dispatchGesture(GestureDescription: Path[(${coords.startX},${coords.startY}) -> (${coords.endX},${coords.endY})])`
        );

        setGestureTrail({ ...coords, active: true });
        setTimeout(() => setGestureTrail(null), 900);
        break;
      }

      case 'SAF_PICKER': {
        addLog('SAF', 'action', 'Intent(ACTION_OPEN_DOCUMENT).setType("*/*") launched with requestCode 2001');
        setDeviceState((prev) => ({ ...prev, currentScreenApp: 'files' }));
        break;
      }

      case 'DEVICE_CONTROL': {
        const setting = parsed.details?.deviceSetting;
        const val = parsed.details?.settingValue;

        if (setting === 'flashlight') {
          setDeviceState((prev) => ({ ...prev, flashlight: Boolean(val) }));
          addLog('SYSTEM', 'info', `CameraManager.setTorchMode("0", ${val})`);
        } else if (setting === 'wifi') {
          setDeviceState((prev) => ({ ...prev, wifiEnabled: Boolean(val) }));
          addLog('SYSTEM', 'info', `WifiManager.setWifiEnabled(${val})`);
        } else if (setting === 'volume') {
          setDeviceState((prev) => ({ ...prev, volume: Number(val) }));
          addLog('SYSTEM', 'info', `AudioManager.setStreamVolume(STREAM_MUSIC, ${val})`);
        }
        break;
      }

      default: {
        addLog('INTENT', 'info', `Processed command locally via fallback regex engine`);
        break;
      }
    }
  };

  const handleEndCall = () => {
    addLog('CALL', 'info', 'InCallService: Call ended by user');
    setDeviceState((prev) => ({
      ...prev,
      activeCall: null,
      currentScreenApp: 'steffy'
    }));
  };

  const handleSimulateClickText = (targetText: string) => {
    handleCommandSubmitted(`click "${targetText}"`);
  };

  const handleSimulateSwipe = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    handleCommandSubmitted(`swipe ${dir.toLowerCase()}`);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Steffy Assistant
              </h1>
              <span className="text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800/80 px-2 py-0.5 rounded-full font-semibold">
                Vosk Offline ASR + Compose
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Offline Acoustic Decoding • Intent Routing • SAF File Picker • Accessibility Screen Automation
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('phone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Device Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('vosk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'vosk'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Vosk Offline ASR</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'inspector'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Accessibility Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>APK Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Source Code</span>
          </button>
        </div>

        {/* Quick APK & Project Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadSteffyApkPackage()}
            title="Download SteffyAssistant-v1.0-debug.apk directly"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Create APK</span>
          </button>

          <button
            onClick={() => downloadAndroidProjectZip()}
            title="Download complete Android Studio Project"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Project .zip</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 min-h-0 p-4 overflow-hidden">
        {activeTab === 'phone' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
            {/* Left: Interactive Android Phone Simulator */}
            <div className="lg:col-span-5 h-full flex items-center justify-center overflow-y-auto">
              <PhoneSimulator
                deviceState={deviceState}
                contacts={contacts}
                lastParsedIntent={lastParsedIntent}
                assistantResponse={assistantResponse}
                isSpeaking={isSpeaking}
                isSpeechEnabled={speechEnabled}
                gestureTrail={gestureTrail}
                clickRipple={clickRipple}
                onCommandSubmitted={handleCommandSubmitted}
                onOpenApp={(appName) => setDeviceState((prev) => ({ ...prev, currentScreenApp: appName }))}
                onToggleSpeech={() => setSpeechEnabled(!speechEnabled)}
                onToggleFlashlight={() =>
                  setDeviceState((prev) => ({ ...prev, flashlight: !prev.flashlight }))
                }
                onToggleWifi={() =>
                  setDeviceState((prev) => ({ ...prev, wifiEnabled: !prev.wifiEnabled }))
                }
                onTogglePermission={(perm) =>
                  setDeviceState((prev) => ({
                    ...prev,
                    grantedPermissions: {
                      ...prev.grantedPermissions,
                      [perm]: !prev.grantedPermissions[perm]
                    }
                  }))
                }
                onToggleAccessibility={() =>
                  setDeviceState((prev) => ({
                    ...prev,
                    accessibilityServiceEnabled: !prev.accessibilityServiceEnabled
                  }))
                }
                onSelectSafFile={(file) => {
                  setDeviceState((prev) => ({ ...prev, openSafFile: file }));
                  addLog('SAF', 'success', `SAF URI resolved: content://com.android.documentsui/${file.name}`, file);
                }}
                onPerformClickText={handleSimulateClickText}
                onEndCall={handleEndCall}
              />
            </div>

            {/* Right: Vosk Acoustic Recognizer & Android Logcat Stream */}
            <div className="lg:col-span-7 h-full flex flex-col gap-4 min-h-0">
              <div className="h-[48%] min-h-[260px]">
                <VoskVisualizer
                  isListening={isVoskListening}
                  onToggleListening={toggleVoskListening}
                  onTranscribeResult={(text) => handleCommandSubmitted(text)}
                  partialText={voskPartialText}
                />
              </div>

              <div className="flex-1 min-h-[220px]">
                <SystemLogcat logs={logs} onClearLogs={() => setLogs([])} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vosk' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
            <div className="lg:col-span-6 h-full flex items-center justify-center">
              <PhoneSimulator
                deviceState={deviceState}
                contacts={contacts}
                lastParsedIntent={lastParsedIntent}
                assistantResponse={assistantResponse}
                isSpeaking={isSpeaking}
                isSpeechEnabled={speechEnabled}
                gestureTrail={gestureTrail}
                clickRipple={clickRipple}
                onCommandSubmitted={handleCommandSubmitted}
                onOpenApp={(appName) => setDeviceState((prev) => ({ ...prev, currentScreenApp: appName }))}
                onToggleSpeech={() => setSpeechEnabled(!speechEnabled)}
                onToggleFlashlight={() =>
                  setDeviceState((prev) => ({ ...prev, flashlight: !prev.flashlight }))
                }
                onToggleWifi={() =>
                  setDeviceState((prev) => ({ ...prev, wifiEnabled: !prev.wifiEnabled }))
                }
                onTogglePermission={(perm) =>
                  setDeviceState((prev) => ({
                    ...prev,
                    grantedPermissions: {
                      ...prev.grantedPermissions,
                      [perm]: !prev.grantedPermissions[perm]
                    }
                  }))
                }
                onToggleAccessibility={() =>
                  setDeviceState((prev) => ({
                    ...prev,
                    accessibilityServiceEnabled: !prev.accessibilityServiceEnabled
                  }))
                }
                onSelectSafFile={(file) => {
                  setDeviceState((prev) => ({ ...prev, openSafFile: file }));
                }}
                onPerformClickText={handleSimulateClickText}
                onEndCall={handleEndCall}
              />
            </div>

            <div className="lg:col-span-6 h-full flex flex-col gap-4 min-h-0">
              <div className="flex-1">
                <VoskVisualizer
                  isListening={isVoskListening}
                  onToggleListening={toggleVoskListening}
                  onTranscribeResult={(text) => handleCommandSubmitted(text)}
                  partialText={voskPartialText}
                />
              </div>
              <div className="h-[38%] min-h-[180px]">
                <SystemLogcat logs={logs} onClearLogs={() => setLogs([])} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inspector' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
            <div className="lg:col-span-6 h-full flex items-center justify-center">
              <PhoneSimulator
                deviceState={deviceState}
                contacts={contacts}
                lastParsedIntent={lastParsedIntent}
                assistantResponse={assistantResponse}
                isSpeaking={isSpeaking}
                isSpeechEnabled={speechEnabled}
                gestureTrail={gestureTrail}
                clickRipple={clickRipple}
                onCommandSubmitted={handleCommandSubmitted}
                onOpenApp={(appName) => setDeviceState((prev) => ({ ...prev, currentScreenApp: appName }))}
                onToggleSpeech={() => setSpeechEnabled(!speechEnabled)}
                onToggleFlashlight={() =>
                  setDeviceState((prev) => ({ ...prev, flashlight: !prev.flashlight }))
                }
                onToggleWifi={() =>
                  setDeviceState((prev) => ({ ...prev, wifiEnabled: !prev.wifiEnabled }))
                }
                onTogglePermission={(perm) =>
                  setDeviceState((prev) => ({
                    ...prev,
                    grantedPermissions: {
                      ...prev.grantedPermissions,
                      [perm]: !prev.grantedPermissions[perm]
                    }
                  }))
                }
                onToggleAccessibility={() =>
                  setDeviceState((prev) => ({
                    ...prev,
                    accessibilityServiceEnabled: !prev.accessibilityServiceEnabled
                  }))
                }
                onSelectSafFile={(file) => {
                  setDeviceState((prev) => ({ ...prev, openSafFile: file }));
                }}
                onPerformClickText={handleSimulateClickText}
                onEndCall={handleEndCall}
              />
            </div>

            <div className="lg:col-span-6 h-full">
              <AccessibilityInspector
                currentApp={deviceState.currentScreenApp}
                deviceState={deviceState}
                onSimulateClickText={handleSimulateClickText}
                onSimulateSwipe={handleSimulateSwipe}
                onToggleAccessibilityService={() =>
                  setDeviceState((prev) => ({
                    ...prev,
                    accessibilityServiceEnabled: !prev.accessibilityServiceEnabled
                  }))
                }
              />
            </div>
          </div>
        )}

        {activeTab === 'apk' && (
          <div className="h-full max-w-7xl mx-auto">
            <ApkBuilderView />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="h-full max-w-7xl mx-auto">
            <ProjectCodeViewer />
          </div>
        )}
      </main>
    </div>
  );
}
