import React from 'react';
import { Terminal, Trash2, Shield, Activity, Radio } from 'lucide-react';
import type { LogEntry } from '../types/assistant.ts';

interface SystemLogcatProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const SystemLogcat: React.FC<SystemLogcatProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-lg">
      {/* Logcat Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>Android Logcat & Intent Stream</span>
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LOGCAT LIVE
              </span>
            </h3>
          </div>
        </div>

        <button
          onClick={onClearLogs}
          title="Clear logs"
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-[11px] bg-slate-950/80">
        {logs.length === 0 ? (
          <div className="text-center text-slate-600 py-8">
            Waiting for assistant commands and system intents...
          </div>
        ) : (
          logs.map((log) => {
            const levelColor =
              log.level === 'action'
                ? 'text-cyan-400 border-cyan-800/60 bg-cyan-950/20'
                : log.level === 'success'
                ? 'text-emerald-400 border-emerald-800/60 bg-emerald-950/20'
                : log.level === 'warn'
                ? 'text-amber-400 border-amber-800/60 bg-amber-950/20'
                : 'text-slate-300 border-slate-800/80 bg-slate-900/40';

            return (
              <div
                key={log.id}
                className={`p-2 rounded-lg border leading-snug flex items-start justify-between gap-2 ${levelColor}`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-950/80 uppercase">
                      [{log.type}]
                    </span>
                  </div>
                  <div className="text-slate-200 break-words">{log.message}</div>
                  {log.metadata && (
                    <div className="text-[10px] text-slate-400 opacity-90 truncate">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
