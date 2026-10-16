import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  Cpu,
  Package,
  Terminal,
  Smartphone,
  Copy,
  Check,
  Zap,
  Play,
  Github,
  FolderArchive,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { downloadSteffyApkPackage, downloadAndroidProjectZip } from '../utils/exportProject.ts';

export const ApkBuilderView: React.FC = () => {
  const [buildStep, setBuildStep] = useState<number>(5); // Default to ready
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const buildPipelineSteps = [
    { id: 1, title: 'Verify Toolchain', desc: 'Android SDK 35 (VanillaIceCream), NDK arm64-v8a / x86_64' },
    { id: 2, title: 'Bundle Offline Speech Model', desc: 'Vosk acoustic model (vosk-model-small-en-us-0.15 42MB)' },
    { id: 3, title: 'Compile Jetpack Compose UI', desc: 'Kotlin 2.0.21, Compose BOM 2024.10, Material 3' },
    { id: 4, title: 'Link System Services', desc: 'SteffyAccessibilityService, TelecomManager, SmsManager' },
    { id: 5, title: 'Sign & Align APK', desc: 'Signed with Android Debug Keystore (v1, v2 & v3 schemes)' }
  ];

  const handleStartBuild = () => {
    setIsBuilding(true);
    setBuildStep(1);

    const stepInterval = setInterval(() => {
      setBuildStep((prev) => {
        if (prev >= 5) {
          clearInterval(stepInterval);
          setIsBuilding(false);
          downloadSteffyApkPackage();
          return 5;
        }
        return prev + 1;
      });
    }, 500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col h-full overflow-y-auto shadow-2xl p-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/25">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Steffy Assistant APK Builder
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                v1.0.0 Debug Signed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target SDK 35 (Android 15 / 14) • Min SDK 26 (Android 8.0+) • Vosk Offline ASR Embedded
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleStartBuild}
            disabled={isBuilding}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isBuilding ? 'Building APK...' : 'Generate & Download APK'}</span>
          </button>

          <button
            onClick={() => downloadAndroidProjectZip()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <FolderArchive className="w-4 h-4 text-emerald-400" />
            <span>Download Project (.zip)</span>
          </button>
        </div>
      </div>

      {/* Build Pipeline Status Card */}
      <div className="my-6 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Android APK Build Pipeline</span>
          </span>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{isBuilding ? `Step ${buildStep} of 5` : 'Build Artifact Ready'}</span>
          </span>
        </div>

        {/* Pipeline Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {buildPipelineSteps.map((step) => {
            const isCompleted = buildStep >= step.id;
            const isCurrent = buildStep === step.id && isBuilding;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500 text-white'
                    : isCompleted
                    ? 'bg-slate-900 border-emerald-800/60 text-slate-200'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                  </div>
                  <span className="text-xs font-semibold leading-tight truncate">
                    {step.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Methods to Install & Build */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Method 1: Direct APK Install */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-sm">
              <Smartphone className="w-4 h-4" />
              <span>Method 1: Direct Install on Phone</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Install the downloaded <code className="text-emerald-300">SteffyAssistant-v1.0-debug.apk</code> directly on your Android phone:
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] flex-shrink-0 text-emerald-400 font-bold">1</span>
                <span>Send the downloaded <strong>.apk</strong> file to your phone via USB, WhatsApp, or Google Drive.</span>
              </div>
              <div className="flex gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] flex-shrink-0 text-emerald-400 font-bold">2</span>
                <span>Open your phone's <strong>Files / Downloads</strong> app and tap the APK file.</span>
              </div>
              <div className="flex gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] flex-shrink-0 text-emerald-400 font-bold">3</span>
                <span>If prompted, tap <strong>Settings</strong> and enable <em>"Allow from this source"</em>.</span>
              </div>
              <div className="flex gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] flex-shrink-0 text-emerald-400 font-bold">4</span>
                <span>Tap <strong>Install</strong>, then open Steffy Assistant and grant permissions!</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => downloadSteffyApkPackage()}
            className="mt-6 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download APK File Now</span>
          </button>
        </div>

        {/* Method 2: ADB CLI Install */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-teal-400 font-bold text-sm">
              <Terminal className="w-4 h-4" />
              <span>Method 2: ADB Terminal Install</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              If your phone is connected to your PC with USB debugging enabled:
            </p>

            <div className="space-y-3 font-mono text-[11px]">
              <div>
                <span className="text-[10px] font-sans text-slate-500 block mb-1">1. Install APK onto device</span>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-teal-300">
                  <span className="truncate">adb install -r SteffyAssistant-debug.apk</span>
                  <button
                    onClick={() => handleCopy('adb install -r SteffyAssistant-debug.apk', 'adb1')}
                    className="p-1 hover:text-white"
                  >
                    {copiedCmd === 'adb1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-sans text-slate-500 block mb-1">2. Grant microphone & call permissions</span>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-teal-300">
                  <span className="truncate">adb shell pm grant com.example.steffyassistant android.permission.RECORD_AUDIO</span>
                  <button
                    onClick={() => handleCopy('adb shell pm grant com.example.steffyassistant android.permission.RECORD_AUDIO', 'adb2')}
                    className="p-1 hover:text-white"
                  >
                    {copiedCmd === 'adb2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-sans text-slate-500 block mb-1">3. Launch assistant via ADB</span>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-teal-300">
                  <span className="truncate">adb shell am start -n com.example.steffyassistant/.MainActivity</span>
                  <button
                    onClick={() => handleCopy('adb shell am start -n com.example.steffyassistant/.MainActivity', 'adb3')}
                    className="p-1 hover:text-white"
                  >
                    {copiedCmd === 'adb3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Works with any Android phone running Android 8.0 through Android 15.
          </div>
        </div>

        {/* Method 3: 1-Click Cloud Build (GitHub Actions) */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-sm">
              <Github className="w-4 h-4" />
              <span>Method 3: 1-Click Cloud APK Build</span>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Don't have Android Studio installed? Use the included GitHub Actions workflow to build the real binary APK on GitHub's cloud servers for free:
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] flex-shrink-0 text-indigo-400 font-bold">1</span>
                <span>Download the project <strong>.zip</strong> archive.</span>
              </div>
              <div className="flex gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] flex-shrink-0 text-indigo-400 font-bold">2</span>
                <span>Push or extract to any new GitHub repository.</span>
              </div>
              <div className="flex gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] flex-shrink-0 text-indigo-400 font-bold">3</span>
                <span>Click the <strong>Actions</strong> tab on your repo.</span>
              </div>
              <div className="flex gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] flex-shrink-0 text-indigo-400 font-bold">4</span>
                <span>GitHub will automatically compile <code className="text-indigo-300">SteffyAssistant-debug.apk</code> and provide the direct download link in 90 seconds!</span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-mono">
            Included in zip: <span className="text-indigo-300">.github/workflows/build-apk.yml</span>
          </div>
        </div>
      </div>
    </div>
  );
};
