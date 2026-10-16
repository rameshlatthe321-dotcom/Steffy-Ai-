import React, { useState } from 'react';
import {
  Play,
  ThumbsUp,
  Share2,
  Bell,
  Search,
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Send,
  Camera,
  RotateCcw,
  Zap,
  Folder,
  FileText,
  Image as ImageIcon,
  Music,
  CheckCircle2,
  Shield,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Sliders,
  Volume2,
  Wifi,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import type { DeviceState, Contact } from '../types/assistant.ts';

interface SimulatedAppsProps {
  currentApp: string;
  deviceState: DeviceState;
  contacts: Contact[];
  onOpenApp: (appName: string) => void;
  onTogglePermission: (permission: keyof DeviceState['grantedPermissions']) => void;
  onToggleAccessibility: () => void;
  onSelectSafFile: (file: { name: string; size: string; type: string; content: string }) => void;
  onPerformClickText: (text: string) => void;
  onEndCall: () => void;
}

export const SimulatedApps: React.FC<SimulatedAppsProps> = ({
  currentApp,
  deviceState,
  contacts,
  onOpenApp,
  onTogglePermission,
  onToggleAccessibility,
  onSelectSafFile,
  onPerformClickText,
  onEndCall,
}) => {
  // App-specific internal states
  const [youtubeSubscribed, setYoutubeSubscribed] = useState(false);
  const [youtubeLiked, setYoutubeLiked] = useState(false);
  const [whatsappInput, setWhatsappInput] = useState('');
  const [whatsappChat, setWhatsappChat] = useState<{ sender: 'mom' | 'me'; text: string; time: string }[]>([
    { sender: 'mom', text: 'Hey, are you coming over for dinner tonight?', time: '7:15 PM' },
    { sender: 'me', text: 'Yes, almost finished with work!', time: '7:18 PM' }
  ]);
  const [cameraMode, setCameraMode] = useState<'PHOTO' | 'VIDEO' | 'PORTRAIT'>('PHOTO');

  // 1. YOUTUBE APP SIMULATION
  if (currentApp === 'youtube') {
    return (
      <div className="flex flex-col h-full bg-neutral-900 text-white select-none overflow-y-auto">
        {/* YouTube Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 sticky top-0 z-10">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-4 bg-red-600 rounded-sm flex items-center justify-center">
              <Play className="w-2.5 h-2.5 fill-white text-white" />
            </div>
            <span className="font-bold text-sm tracking-tighter">YouTube</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-300">
            <Search className="w-4 h-4 cursor-pointer" />
            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold">
              U
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform">
            <Play className="w-6 h-6 fill-white text-white ml-0.5" />
          </div>
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-neutral-300">
            <span>Building Offline Android Assistants with Jetpack Compose</span>
            <span className="bg-red-600 text-white px-1 rounded text-[9px] font-bold">LIVE</span>
          </div>
        </div>

        {/* Video Actions & Channel Info */}
        <div className="p-3 border-b border-neutral-800 space-y-3">
          <h2 className="text-sm font-semibold leading-snug">
            Automating Android with AccessibilityService & SpeechRecognizer (Full Tutorial)
          </h2>
          <div className="text-xs text-neutral-400">142K views • 2 hours ago</div>

          {/* Channel Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                AD
              </div>
              <div>
                <div className="text-xs font-semibold leading-tight">Android Devs Official</div>
                <div className="text-[10px] text-neutral-400">845K subscribers</div>
              </div>
            </div>

            {/* Target element for Accessibility automated click! */}
            <button
              onClick={() => {
                setYoutubeSubscribed(!youtubeSubscribed);
                onPerformClickText(youtubeSubscribed ? 'Subscribe' : 'Subscribed');
              }}
              data-text="Subscribe"
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                youtubeSubscribed
                  ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {youtubeSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-around pt-1 text-xs text-neutral-300">
            <button
              onClick={() => setYoutubeLiked(!youtubeLiked)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 ${
                youtubeLiked ? 'text-red-400' : ''
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${youtubeLiked ? 'fill-red-400' : ''}`} />
              <span>{youtubeLiked ? '12K' : '11.9K'}</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700">
              <Bell className="w-3.5 h-3.5" />
              <span>Notify</span>
            </button>
          </div>
        </div>

        {/* Up Next List */}
        <div className="p-3 space-y-3">
          <div className="text-xs font-semibold text-neutral-400">Up next</div>
          <div className="flex gap-2.5 items-start">
            <div className="w-24 h-14 bg-neutral-800 rounded flex-shrink-0 flex items-center justify-center text-[10px] text-neutral-500">
              Video 2
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium line-clamp-2">Offline LLMs on Mobile: Ollama & LiteRT Guide</div>
              <div className="text-[10px] text-neutral-400 mt-1">Tech Pulse • 48K views</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. WHATSAPP APP SIMULATION
  if (currentApp === 'whatsapp') {
    return (
      <div className="flex flex-col h-full bg-[#0b141a] text-[#e9edef] select-none">
        {/* WhatsApp Top Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#202c33] border-b border-[#222d34]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-pink-600 flex items-center justify-center text-xs font-bold text-white">
              M
            </div>
            <div>
              <div className="text-xs font-semibold leading-tight">Mom</div>
              <div className="text-[10px] text-emerald-400">online</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[#aebac1]">
            <Video className="w-4 h-4 cursor-pointer hover:text-white" />
            <Phone
              className="w-4 h-4 cursor-pointer hover:text-white"
              onClick={() => onOpenApp('dialer')}
            />
            <MoreVertical className="w-4 h-4 cursor-pointer" />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#0b141a]">
          <div className="text-center">
            <span className="text-[10px] bg-[#182229] text-[#8696a0] px-2 py-0.5 rounded shadow">
              TODAY
            </span>
          </div>

          {whatsappChat.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[78%] px-2.5 py-1.5 rounded-lg text-xs ${
                  msg.sender === 'me'
                    ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                    : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                }`}
              >
                <div>{msg.text}</div>
                <div className="text-[9px] text-[#8696a0] text-right mt-0.5">{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Bottom Input */}
        <div className="p-2 bg-[#202c33] flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={whatsappInput}
            onChange={(e) => setWhatsappInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && whatsappInput.trim()) {
                setWhatsappChat((prev) => [
                  ...prev,
                  { sender: 'me', text: whatsappInput.trim(), time: 'Just now' }
                ]);
                setWhatsappInput('');
              }
            }}
            className="flex-1 bg-[#2a3942] text-xs text-white rounded-full px-3 py-1.5 focus:outline-none placeholder-[#8696a0]"
          />
          <button
            onClick={() => {
              if (whatsappInput.trim()) {
                setWhatsappChat((prev) => [
                  ...prev,
                  { sender: 'me', text: whatsappInput.trim(), time: 'Just now' }
                ]);
                setWhatsappInput('');
              }
            }}
            className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center text-white hover:bg-[#06cf9c]"
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>
    );
  }

  // 3. STORAGE ACCESS FRAMEWORK (SAF) FILE PICKER
  if (currentApp === 'files') {
    const mockFiles = [
      { name: 'steffy_architecture_spec.pdf', size: '2.4 MB', type: 'PDF Document', content: 'Steffy Assistant Architecture: Jetpack Compose + Intent Router + AccessibilityService' },
      { name: 'contacts_backup.vcf', size: '14 KB', type: 'VCard', content: 'BEGIN:VCARD\nVERSION:3.0\nN:Doe;John;;;\nTEL:+15558765432\nEND:VCARD' },
      { name: 'meeting_notes.txt', size: '4 KB', type: 'Text Document', content: 'Meeting notes: Discuss offline STT latency and on-device whisper integration.' },
      { name: 'voice_sample_audio.wav', size: '1.2 MB', type: 'Audio File', content: '[Offline synthetic utterance stream decoded successfully]' },
      { name: 'screenshot_screen_tree.png', size: '640 KB', type: 'PNG Image', content: '[AccessibilityNodeInfo tree snapshot binary data]' }
    ];

    return (
      <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
        {/* SAF Header */}
        <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold">Open from: Internal Storage</span>
          </div>
          <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
            SAF 2001
          </span>
        </div>

        <div className="p-2 bg-slate-850 text-[11px] text-slate-400 border-b border-slate-800">
          Storage Access Framework (SAF) DocumentsUI
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {mockFiles.map((f, i) => (
            <div
              key={i}
              onClick={() => onSelectSafFile(f)}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 cursor-pointer border border-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {f.type.includes('PDF') ? (
                  <FileText className="w-4 h-4 text-red-400" />
                ) : f.type.includes('Audio') ? (
                  <Music className="w-4 h-4 text-emerald-400" />
                ) : f.type.includes('Image') ? (
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                ) : (
                  <FileText className="w-4 h-4 text-amber-400" />
                )}
                <div>
                  <div className="text-xs font-medium text-slate-200 line-clamp-1">{f.name}</div>
                  <div className="text-[10px] text-slate-400">{f.size} • {f.type}</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </div>
          ))}
        </div>

        {/* Selected file preview footer if any */}
        {deviceState.openSafFile && (
          <div className="p-3 bg-slate-800 border-t border-slate-700">
            <div className="text-[10px] text-emerald-400 font-semibold mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Selected via SAF Result:
            </div>
            <div className="text-xs font-mono text-slate-200 truncate">
              {deviceState.openSafFile.name}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              "{deviceState.openSafFile.content.slice(0, 70)}..."
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. PHONE / DIALER APP
  if (currentApp === 'dialer') {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-white select-none">
        {/* Header */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200">Phone & Contacts</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
            TelecomManager
          </span>
        </div>

        {/* If Active Call */}
        {deviceState.activeCall ? (
          <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="text-center mt-4 space-y-1">
              <div className="w-20 h-20 rounded-full bg-emerald-600/30 border border-emerald-500/40 mx-auto flex items-center justify-center text-2xl font-bold text-emerald-300">
                {deviceState.activeCall.contactName ? deviceState.activeCall.contactName[0] : '#'}
              </div>
              <h2 className="text-lg font-bold text-white mt-3">
                {deviceState.activeCall.contactName || deviceState.activeCall.phoneNumber}
              </h2>
              <div className="text-xs text-slate-400 font-mono">
                {deviceState.activeCall.phoneNumber}
              </div>
              <div className="text-xs font-semibold text-emerald-400 animate-pulse mt-2">
                00:{deviceState.activeCall.duration < 10 ? `0${deviceState.activeCall.duration}` : deviceState.activeCall.duration} • Connected (HD)
              </div>
            </div>

            {/* In-Call Controls */}
            <div className="w-full space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <button className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300">
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <span className="text-[10px] text-slate-400">Speaker</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300">
                    <Sliders className="w-5 h-5" />
                  </button>
                  <span className="text-[10px] text-slate-400">Keypad</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300">
                    <Zap className="w-5 h-5" />
                  </button>
                  <span className="text-[10px] text-slate-400">Mute</span>
                </div>
              </div>

              {/* End Call Button */}
              <button
                onClick={onEndCall}
                className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
              >
                <Phone className="w-4 h-4 rotate-[135deg]" />
                End Call
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">SPEED DIAL CONTACTS</div>
            <div className="space-y-1.5 flex-1">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow"
                      style={{ backgroundColor: c.avatarColor }}
                    >
                      {c.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-100">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.phoneNumber}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onPerformClickText(`Call ${c.name}`)}
                    className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 5. CAMERA APP
  if (currentApp === 'camera') {
    return (
      <div className="flex flex-col h-full bg-black text-white select-none relative">
        <div className="flex items-center justify-between p-3 z-10">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-mono text-slate-400">1080p • 60 FPS</span>
          <SlidersHorizontal className="w-4 h-4 text-slate-300" />
        </div>

        {/* Viewfinder simulation */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/40" />
          <div className="w-32 h-32 border border-white/30 rounded-2xl flex items-center justify-center">
            <div className="w-3 h-3 border-t-2 border-l-2 border-emerald-400 absolute top-4 left-4" />
            <div className="w-3 h-3 border-t-2 border-r-2 border-emerald-400 absolute top-4 right-4" />
            <div className="w-3 h-3 border-b-2 border-l-2 border-emerald-400 absolute bottom-4 left-4" />
            <div className="w-3 h-3 border-b-2 border-r-2 border-emerald-400 absolute bottom-4 right-4" />
            <span className="text-[10px] text-white/50 font-mono">AutoFocus</span>
          </div>
        </div>

        {/* Camera Controls */}
        <div className="p-4 bg-black/90 flex flex-col items-center gap-3">
          <div className="flex gap-4 text-xs font-semibold">
            {(['PHOTO', 'VIDEO', 'PORTRAIT'] as const).map((mode) => (
              <span
                key={mode}
                onClick={() => setCameraMode(mode)}
                className={`cursor-pointer ${cameraMode === mode ? 'text-amber-400 underline underline-offset-4' : 'text-slate-500'}`}
              >
                {mode}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-around w-full mt-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer">
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </div>
            <button className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-full active:scale-95 transition-transform" />
            </button>
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden cursor-pointer flex items-center justify-center text-[10px] text-slate-400">
              Gallery
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. SETTINGS APP
  if (currentApp === 'settings') {
    return (
      <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none overflow-y-auto">
        <div className="p-3 bg-slate-800 border-b border-slate-700">
          <h2 className="text-sm font-bold text-slate-100">Android System Settings</h2>
          <div className="text-[10px] text-slate-400">Steffy Assistant Integrations</div>
        </div>

        <div className="p-3 space-y-4 text-xs">
          {/* Accessibility Service Section */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">Steffy Accessibility Service</span>
              </div>
              <button
                onClick={onToggleAccessibility}
                className="text-emerald-400 focus:outline-none"
              >
                {deviceState.accessibilityServiceEnabled ? (
                  <ToggleRight className="w-7 h-7 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-600" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Allows Steffy to inspect on-screen UI nodes (<code className="text-emerald-300">AccessibilityNodeInfo</code>), click buttons by label, and dispatch gesture swipes.
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-1">
              Status: {deviceState.accessibilityServiceEnabled ? 'ACTIVE (typeAllMask | canPerformGestures)' : 'DISABLED'}
            </div>
          </div>

          {/* App Permissions Checklist */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2.5">
            <span className="font-semibold text-slate-200 block mb-1">Runtime App Permissions</span>
            {([
              { key: 'CALL_PHONE', label: 'Phone Calls (android.permission.CALL_PHONE)' },
              { key: 'SEND_SMS', label: 'SMS Messaging (android.permission.SEND_SMS)' },
              { key: 'READ_CONTACTS', label: 'Contacts (android.permission.READ_CONTACTS)' },
              { key: 'RECORD_AUDIO', label: 'Microphone (android.permission.RECORD_AUDIO)' }
            ] as const).map(({ key, label }) => {
              const granted = deviceState.grantedPermissions[key];
              return (
                <div key={key} className="flex items-center justify-between py-1 border-b border-slate-700/50 last:border-0">
                  <span className="text-[11px] text-slate-300">{label}</span>
                  <button
                    onClick={() => onTogglePermission(key)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      granted
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {granted ? 'Granted' : 'Denied'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Device Toggles */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="font-semibold text-slate-200 block">Hardware Controls</span>
            <div className="flex items-center justify-between text-[11px] py-1">
              <span>Flashlight (Torch)</span>
              <span className={`font-mono ${deviceState.flashlight ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                {deviceState.flashlight ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] py-1">
              <span>Wi-Fi Network</span>
              <span className={`font-mono ${deviceState.wifiEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                {deviceState.wifiEnabled ? 'Connected (5 GHz)' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};
