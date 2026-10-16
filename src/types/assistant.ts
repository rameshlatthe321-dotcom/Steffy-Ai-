export type IntentType =
  | 'CALL'
  | 'SMS'
  | 'LAUNCH_APP'
  | 'ACCESSIBILITY_CLICK'
  | 'ACCESSIBILITY_SWIPE'
  | 'SAF_PICKER'
  | 'DEVICE_CONTROL'
  | 'STATUS_QUERY'
  | 'UNKNOWN';

export type SwipeDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface ParsedIntent {
  rawInput: string;
  type: IntentType;
  confidence: number;
  spokenResponse: string;
  details?: {
    phoneNumber?: string;
    contactName?: string;
    smsMessage?: string;
    appName?: string;
    packageName?: string;
    clickTarget?: string;
    swipeDirection?: SwipeDirection;
    deviceSetting?: 'flashlight' | 'volume' | 'brightness' | 'wifi' | 'bluetooth';
    settingValue?: boolean | number | string;
    fileName?: string;
  };
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatarColor: string;
  role?: string;
}

export interface InstalledApp {
  id: string;
  name: string;
  packageName: string;
  icon: string;
  category: 'social' | 'media' | 'utility' | 'system';
  color: string;
  description: string;
}

export interface AccessibilityNode {
  id: string;
  text: string;
  role: 'button' | 'text' | 'input' | 'switch' | 'card';
  bounds: { x: number; y: number; w: number; h: number };
  clickable: boolean;
  checked?: boolean;
}

export interface DeviceState {
  battery: number;
  isCharging: boolean;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  flashlight: boolean;
  volume: number;
  brightness: number;
  airplaneMode: boolean;
  activeCall: {
    phoneNumber: string;
    contactName?: string;
    duration: number;
    isMuted: boolean;
    onSpeaker: boolean;
    state: 'DIALING' | 'CONNECTED' | 'ENDED';
  } | null;
  accessibilityServiceEnabled: boolean;
  grantedPermissions: {
    CALL_PHONE: boolean;
    SEND_SMS: boolean;
    READ_CONTACTS: boolean;
    RECORD_AUDIO: boolean;
    ACCESSIBILITY: boolean;
  };
  openSafFile: {
    name: string;
    size: string;
    type: string;
    content: string;
  } | null;
  currentScreenApp: string; // 'steffy' | 'youtube' | 'whatsapp' | 'camera' | 'settings' | 'files' | 'dialer' | 'sms'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INTENT' | 'CALL' | 'SMS' | 'LAUNCH' | 'ACCESSIBILITY' | 'SAF' | 'SYSTEM';
  level: 'info' | 'success' | 'warn' | 'action';
  message: string;
  metadata?: Record<string, any>;
}
