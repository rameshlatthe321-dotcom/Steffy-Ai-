import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  FolderGit2,
  ExternalLink,
  Smartphone,
  Cpu,
  Layers,
  Terminal,
  BookOpen
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, AndroidProjectFile } from '../utils/androidProjectFiles.ts';
import { downloadAndroidProjectZip } from '../utils/exportProject.ts';

export const ProjectCodeViewer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentFile = ANDROID_PROJECT_FILES[selectedFileIndex] || ANDROID_PROJECT_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      await downloadAndroidProjectZip();
    } catch (err) {
      console.error('Failed to export zip:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Android Studio Project Architecture</span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-700">
                Kotlin 2.0 • Compose BOM
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Ready to compile directly in Android Studio onto any physical Android device or emulator
            </p>
          </div>
        </div>

        {/* Download Zip Action */}
        <button
          onClick={handleDownloadZip}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/25 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Packaging Zip...' : 'Download Project (.zip)'}</span>
        </button>
      </div>

      {/* Main File Explorer & Code Viewer */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left File List */}
        <div className="w-full md:w-64 bg-slate-950/60 border-r border-slate-800/80 p-2 overflow-y-auto space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Project Files</span>
          </div>
          {ANDROID_PROJECT_FILES.map((file, idx) => (
            <button
              key={file.name}
              onClick={() => setSelectedFileIndex(idx)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-colors flex items-center gap-2 ${
                selectedFileIndex === idx
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-semibold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
              <div className="truncate">
                <div className="truncate">{file.name}</div>
                <div className="text-[9px] text-slate-500 truncate font-sans font-normal">
                  {file.language.toUpperCase()}
                </div>
              </div>
            </button>
          ))}

          {/* Quick instructions box */}
          <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1 text-slate-200 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>How to test APK:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[10px] text-slate-400 leading-normal">
              <li>Download & extract .zip</li>
              <li>Open in Android Studio</li>
              <li>Wait for Gradle sync</li>
              <li>Hit Run (Shift + F10)</li>
              <li>Enable Accessibility in Settings</li>
            </ol>
          </div>
        </div>

        {/* Right Code Display */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
          {/* File Toolbar */}
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-300 font-semibold">{currentFile.path}</span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">— {currentFile.description}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Code Body */}
          <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs leading-relaxed text-slate-300 selection:bg-emerald-500/30">
            <pre className="whitespace-pre">{currentFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
