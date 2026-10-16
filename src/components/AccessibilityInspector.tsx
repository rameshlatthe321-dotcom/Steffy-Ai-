import React, { useState } from 'react';
import {
  ShieldCheck,
  MousePointerClick,
  Move,
  CornerDownRight,
  Code2,
  Terminal,
  Layers,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';
import type { DeviceState, AccessibilityNode } from '../types/assistant.ts';

interface AccessibilityInspectorProps {
  currentApp: string;
  deviceState: DeviceState;
  onSimulateClickText: (text: string) => void;
  onSimulateSwipe: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onToggleAccessibilityService: () => void;
}

export const AccessibilityInspector: React.FC<AccessibilityInspectorProps> = ({
  currentApp,
  deviceState,
  onSimulateClickText,
  onSimulateSwipe,
  onToggleAccessibilityService,
}) => {
  const [customClickQuery, setCustomClickQuery] = useState('');

  // Generate simulated AccessibilityNodeInfo hierarchy based on current screen
  const getNodeHierarchy = (): AccessibilityNode[] => {
    switch (currentApp) {
      case 'youtube':
        return [
          { id: 'node_yt_root', text: 'YouTube Active Window', role: 'card', bounds: { x: 0, y: 0, w: 390, h: 780 }, clickable: false },
          { id: 'node_yt_search', text: 'Search YouTube', role: 'input', bounds: { x: 300, y: 35, w: 40, h: 40 }, clickable: true },
          { id: 'node_yt_video', text: 'Building Offline Android Assistants with Jetpack Compose', role: 'button', bounds: { x: 0, y: 50, w: 390, h: 220 }, clickable: true },
          { id: 'node_yt_sub', text: 'Subscribe', role: 'button', bounds: { x: 260, y: 345, w: 110, h: 36 }, clickable: true },
          { id: 'node_yt_like', text: 'Like Video', role: 'button', bounds: { x: 20, y: 390, w: 80, h: 36 }, clickable: true },
          { id: 'node_yt_share', text: 'Share', role: 'button', bounds: { x: 120, y: 390, w: 80, h: 36 }, clickable: true }
        ];
      case 'whatsapp':
        return [
          { id: 'node_wa_root', text: 'WhatsApp Conversation', role: 'card', bounds: { x: 0, y: 0, w: 390, h: 780 }, clickable: false },
          { id: 'node_wa_call', text: 'Call Mom', role: 'button', bounds: { x: 320, y: 35, w: 35, h: 35 }, clickable: true },
          { id: 'node_wa_input', text: 'Type a message...', role: 'input', bounds: { x: 15, y: 720, w: 300, h: 44 }, clickable: true },
          { id: 'node_wa_send', text: 'Send', role: 'button', bounds: { x: 330, y: 720, w: 44, h: 44 }, clickable: true }
        ];
      case 'files':
        return [
          { id: 'node_saf_root', text: 'Storage Access Framework DocumentsUI', role: 'card', bounds: { x: 0, y: 0, w: 390, h: 780 }, clickable: false },
          { id: 'node_saf_item1', text: 'steffy_architecture_spec.pdf', role: 'button', bounds: { x: 10, y: 100, w: 370, h: 50 }, clickable: true },
          { id: 'node_saf_item2', text: 'contacts_backup.vcf', role: 'button', bounds: { x: 10, y: 160, w: 370, h: 50 }, clickable: true },
          { id: 'node_saf_item3', text: 'meeting_notes.txt', role: 'button', bounds: { x: 10, y: 220, w: 370, h: 50 }, clickable: true }
        ];
      case 'dialer':
        return [
          { id: 'node_call_root', text: 'TelecomManager InCallService', role: 'card', bounds: { x: 0, y: 0, w: 390, h: 780 }, clickable: false },
          { id: 'node_call_mom', text: 'Call Mom', role: 'button', bounds: { x: 20, y: 80, w: 350, h: 60 }, clickable: true },
          { id: 'node_call_john', text: 'Call John Doe', role: 'button', bounds: { x: 20, y: 150, w: 350, h: 60 }, clickable: true }
        ];
      default:
        return [
          { id: 'node_steffy_root', text: 'Steffy Assistant Main UI', role: 'card', bounds: { x: 0, y: 0, w: 390, h: 780 }, clickable: false },
          { id: 'node_steffy_saf', text: 'Open Files (SAF)', role: 'button', bounds: { x: 280, y: 45, w: 90, h: 32 }, clickable: true },
          { id: 'node_steffy_send', text: 'Send', role: 'button', bounds: { x: 335, y: 715, w: 45, h: 45 }, clickable: true }
        ];
    }
  };

  const nodes = getNodeHierarchy();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col h-full overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Accessibility Service Inspector</h3>
            <span className="text-[10px] text-slate-400 font-mono">
              SteffyAccessibilityService.kt • Active Node Tree
            </span>
          </div>
        </div>

        {/* Toggle Service status */}
        <button
          onClick={onToggleAccessibilityService}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
            deviceState.accessibilityServiceEnabled
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
              : 'bg-red-950 text-red-400 border-red-800 hover:bg-red-900'
          }`}
        >
          {deviceState.accessibilityServiceEnabled ? (
            <>
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Service Active</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>Service Disabled</span>
            </>
          )}
        </button>
      </div>

      {/* Screen Automation Quick Triggers */}
      <div className="my-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Dispatch Gesture / Action to Screen
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Swipes */}
          <button
            onClick={() => onSimulateSwipe('DOWN')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Move className="w-3 h-3 text-indigo-400" />
            <span>performSwipe (Down)</span>
          </button>
          <button
            onClick={() => onSimulateSwipe('UP')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Move className="w-3 h-3 text-indigo-400 rotate-180" />
            <span>performSwipe (Up)</span>
          </button>
        </div>

        {/* Custom text matcher */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Search text to click (e.g. Subscribe)..."
            value={customClickQuery}
            onChange={(e) => setCustomClickQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customClickQuery.trim()) {
                onSimulateClickText(customClickQuery.trim());
                setCustomClickQuery('');
              }
            }}
            className="flex-1 bg-slate-900 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
          <button
            onClick={() => {
              if (customClickQuery.trim()) {
                onSimulateClickText(customClickQuery.trim());
                setCustomClickQuery('');
              }
            }}
            disabled={!customClickQuery.trim()}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1"
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>Click</span>
          </button>
        </div>
      </div>

      {/* Node Tree Hierarchy */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span>Active Window: <span className="font-semibold text-slate-200 uppercase">{currentApp}</span></span>
          <span className="font-mono text-[10px]">{nodes.length} nodes parsed</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
          {nodes.map((node) => (
            <div
              key={node.id}
              onClick={() => node.clickable && onSimulateClickText(node.text)}
              className={`p-2 rounded-lg border transition-all ${
                node.clickable
                  ? 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/80 hover:bg-indigo-950/20 cursor-pointer text-slate-200'
                  : 'bg-slate-950/30 border-slate-900 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <CornerDownRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span className="font-bold text-indigo-400">[{node.role}]</span>
                  <span className="text-slate-200 truncate">"{node.text}"</span>
                </div>
                {node.clickable ? (
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-semibold flex-shrink-0">
                    CLICKABLE
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-600 font-semibold flex-shrink-0">
                    STATIC
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-500 mt-1 pl-4 flex gap-3">
                <span>id: {node.id}</span>
                <span>bounds: [{node.bounds.x},{node.bounds.y},{node.bounds.w}x{node.bounds.h}]</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Snippet Insight */}
      <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
        <div className="flex items-center gap-1 text-slate-300 font-semibold mb-1">
          <Code2 className="w-3 h-3 text-emerald-400" />
          <span>Under the hood in SteffyAccessibilityService.kt:</span>
        </div>
        <p className="font-mono bg-slate-950 p-2 rounded text-emerald-300/90 leading-tight">
          rootNode.findAccessibilityNodeInfosByText("{customClickQuery || 'target'}")?.performAction(ACTION_CLICK)
        </p>
      </div>
    </div>
  );
};
