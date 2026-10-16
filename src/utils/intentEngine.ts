import type { ParsedIntent, Contact, InstalledApp, SwipeDirection } from '../types/assistant.ts';

export const DEFAULT_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Mom', phoneNumber: '+1 (555) 234-5678', avatarColor: '#ec4899', role: 'Family' },
  { id: 'c2', name: 'John Doe', phoneNumber: '+1 (555) 876-5432', avatarColor: '#3b82f6', role: 'Colleague' },
  { id: 'c3', name: 'Alice Smith', phoneNumber: '+1 (555) 432-1098', avatarColor: '#10b981', role: 'Friend' },
  { id: 'c4', name: 'David Miller', phoneNumber: '+1 (555) 789-0123', avatarColor: '#8b5cf6', role: 'Work' },
  { id: 'c5', name: 'Emergency Services', phoneNumber: '911', avatarColor: '#ef4444', role: 'Emergency' }
];

export const INSTALLED_APPS: InstalledApp[] = [
  { id: 'app_steffy', name: 'Steffy Assistant', packageName: 'com.example.steffyassistant', icon: 'Bot', category: 'system', color: '#10b981', description: 'Offline Voice & Automation Assistant' },
  { id: 'app_youtube', name: 'YouTube', packageName: 'com.google.android.youtube', icon: 'PlaySquare', category: 'media', color: '#ef4444', description: 'Watch videos and music' },
  { id: 'app_whatsapp', name: 'WhatsApp', packageName: 'com.whatsapp', icon: 'MessageCircle', category: 'social', color: '#22c55e', description: 'Chat & call with friends' },
  { id: 'app_camera', name: 'Camera', packageName: 'com.android.camera', icon: 'Camera', category: 'media', color: '#06b6d4', description: 'Capture photos and video' },
  { id: 'app_settings', name: 'Settings', packageName: 'com.android.settings', icon: 'Settings', category: 'system', color: '#64748b', description: 'Device & accessibility settings' },
  { id: 'app_files', name: 'Files (SAF)', packageName: 'com.android.documentsui', icon: 'Folder', category: 'utility', color: '#f59e0b', description: 'Storage Access Framework' },
  { id: 'app_calculator', name: 'Calculator', packageName: 'com.android.calculator2', icon: 'Calculator', category: 'utility', color: '#8b5cf6', description: 'Offline calculator' },
  { id: 'app_dialer', name: 'Phone', packageName: 'com.android.dialer', icon: 'Phone', category: 'system', color: '#3b82f6', description: 'Make phone calls' },
  { id: 'app_messages', name: 'Messages', packageName: 'com.android.mms', icon: 'Mail', category: 'system', color: '#eab308', description: 'Send and receive SMS' }
];

export function extractPhoneNumber(input: string): string {
  // Matches digits and optional +
  const cleaned = input.replace(/[^0-9+]/g, '');
  return cleaned;
}

export function findContactByName(nameQuery: string, contacts: Contact[] = DEFAULT_CONTACTS): Contact | null {
  const q = nameQuery.toLowerCase().trim();
  if (!q) return null;
  return contacts.find(c => c.name.toLowerCase() === q || c.name.toLowerCase().includes(q)) || null;
}

export function parseUserCommand(input: string, contacts: Contact[] = DEFAULT_CONTACTS): ParsedIntent {
  const rawInput = input.trim();
  const lower = rawInput.toLowerCase();

  if (!rawInput) {
    return {
      rawInput,
      type: 'UNKNOWN',
      confidence: 0,
      spokenResponse: "I'm listening. You can ask me to call, send SMS, open apps, swipe, or toggle flashlight."
    };
  }

  // 1. CALL INTENT
  // e.g. "call mom", "call +15551234567", "make a call to John Doe", "dial 911"
  if (lower.startsWith('call') || lower.startsWith('dial') || lower.includes('make a call to')) {
    let target = lower.replace(/^(make a call to|call|dial)\s+/i, '').trim();
    // remove punctuation at end
    target = target.replace(/[.!?]+$/, '').trim();

    // Check if target is a contact name
    const contact = findContactByName(target, contacts);
    if (contact) {
      return {
        rawInput,
        type: 'CALL',
        confidence: 0.95,
        spokenResponse: `Calling ${contact.name} at ${contact.phoneNumber} now.`,
        details: {
          phoneNumber: contact.phoneNumber,
          contactName: contact.name
        }
      };
    }

    // Try extracting numbers
    const num = extractPhoneNumber(target);
    if (num.length >= 3) {
      return {
        rawInput,
        type: 'CALL',
        confidence: 0.9,
        spokenResponse: `Calling ${num} now.`,
        details: {
          phoneNumber: num
        }
      };
    }

    return {
      rawInput,
      type: 'CALL',
      confidence: 0.5,
      spokenResponse: "Please specify a valid phone number or contact name to call."
    };
  }

  // 2. SMS INTENT
  // e.g. "text mom saying running late", "send sms to 5551234 saying hello", "message John saying I will call you back"
  if (lower.startsWith('text') || lower.startsWith('send sms') || lower.startsWith('message') || lower.includes('send an sms')) {
    // Check pattern: [text/send sms to] <target> saying/that/message <msg>
    let content = lower.replace(/^(send an sms to|send sms to|send sms|text to|text|message)\s+/i, '').trim();

    let target = '';
    let msg = 'Hello from Steffy';

    if (content.includes(' saying ')) {
      const parts = content.split(' saying ');
      target = parts[0].trim();
      msg = rawInput.substring(rawInput.toLowerCase().indexOf(' saying ') + 8).trim();
    } else if (content.includes(' that ')) {
      const parts = content.split(' that ');
      target = parts[0].trim();
      msg = rawInput.substring(rawInput.toLowerCase().indexOf(' that ') + 6).trim();
    } else if (content.includes(' message ')) {
      const parts = content.split(' message ');
      target = parts[0].trim();
      msg = rawInput.substring(rawInput.toLowerCase().indexOf(' message ') + 9).trim();
    } else {
      // Just "text John" or "send sms to 555"
      target = content;
    }

    target = target.replace(/^to\s+/i, '').trim();

    const contact = findContactByName(target, contacts);
    const phoneNumber = contact ? contact.phoneNumber : extractPhoneNumber(target);

    if (phoneNumber) {
      const recipientLabel = contact ? contact.name : phoneNumber;
      return {
        rawInput,
        type: 'SMS',
        confidence: 0.95,
        spokenResponse: `Sending SMS to ${recipientLabel}: "${msg}"`,
        details: {
          phoneNumber,
          contactName: contact ? contact.name : undefined,
          smsMessage: msg
        }
      };
    }

    return {
      rawInput,
      type: 'SMS',
      confidence: 0.4,
      spokenResponse: "Who should I text? Please provide a contact name or phone number."
    };
  }

  // 3. LAUNCH APP INTENT
  // e.g. "open youtube", "launch whatsapp", "start camera", "open settings", "open files"
  if (lower.startsWith('open ') || lower.startsWith('launch ') || lower.startsWith('start ')) {
    const appQuery = lower.replace(/^(open|launch|start)\s+/i, '').replace(/app$/i, '').trim();

    // Check specific known apps
    for (const app of INSTALLED_APPS) {
      if (
        appQuery.includes(app.name.toLowerCase()) ||
        app.name.toLowerCase().includes(appQuery) ||
        (appQuery === 'files' && app.id === 'app_files') ||
        (appQuery === 'saf' && app.id === 'app_files') ||
        (appQuery === 'browser' && app.id === 'app_youtube')
      ) {
        return {
          rawInput,
          type: 'LAUNCH_APP',
          confidence: 0.95,
          spokenResponse: `Opening ${app.name}.`,
          details: {
            appName: app.name,
            packageName: app.packageName
          }
        };
      }
    }

    // Storage Access Framework specific phrase
    if (appQuery.includes('file picker') || appQuery.includes('storage') || appQuery.includes('document')) {
      return {
        rawInput,
        type: 'SAF_PICKER',
        confidence: 0.9,
        spokenResponse: "Opening Storage Access Framework document picker.",
        details: {
          appName: 'Storage Access Framework'
        }
      };
    }

    return {
      rawInput,
      type: 'LAUNCH_APP',
      confidence: 0.7,
      spokenResponse: `Attempting to launch app "${appQuery}". Package not registered in manifest.`,
      details: {
        appName: appQuery,
        packageName: `com.example.${appQuery.replace(/\s+/g, '')}`
      }
    };
  }

  // 4. ACCESSIBILITY GESTURE: SWIPE
  // e.g. "swipe up", "scroll down", "swipe left", "swipe right", "perform swipe"
  if (lower.includes('swipe') || lower.includes('scroll')) {
    let direction: SwipeDirection = 'UP';
    if (lower.includes('down')) direction = 'DOWN';
    else if (lower.includes('left')) direction = 'LEFT';
    else if (lower.includes('right')) direction = 'RIGHT';
    else if (lower.includes('up')) direction = 'UP';

    return {
      rawInput,
      type: 'ACCESSIBILITY_SWIPE',
      confidence: 0.95,
      spokenResponse: `Dispatching accessibility swipe ${direction.toLowerCase()} gesture.`,
      details: {
        swipeDirection: direction
      }
    };
  }

  // 5. ACCESSIBILITY SCREEN AUTOMATION: CLICK NODE BY TEXT
  // e.g. "click subscribe", "tap settings", "press submit", "click button install"
  if (lower.startsWith('click ') || lower.startsWith('tap ') || lower.startsWith('press ')) {
    const targetText = rawInput
      .replace(/^(click|tap|press)(\s+(on|the|button))?\s+/i, '')
      .replace(/^["']|["']$/g, '')
      .trim();

    if (targetText) {
      return {
        rawInput,
        type: 'ACCESSIBILITY_CLICK',
        confidence: 0.92,
        spokenResponse: `Accessibility service clicking on-screen element "${targetText}".`,
        details: {
          clickTarget: targetText
        }
      };
    }
  }

  // 6. STORAGE ACCESS FRAMEWORK (SAF) DIRECT COMMAND
  if (lower.includes('file picker') || lower.includes('open document') || lower.includes('pick file') || lower.includes('storage access')) {
    return {
      rawInput,
      type: 'SAF_PICKER',
      confidence: 0.95,
      spokenResponse: "Opening Android Storage Access Framework file browser.",
      details: {
        appName: 'Files'
      }
    };
  }

  // 7. DEVICE CONTROLS
  if (lower.includes('flashlight') || lower.includes('torch')) {
    const turnOn = !lower.includes('off');
    return {
      rawInput,
      type: 'DEVICE_CONTROL',
      confidence: 0.95,
      spokenResponse: turnOn ? "Flashlight turned on." : "Flashlight turned off.",
      details: {
        deviceSetting: 'flashlight',
        settingValue: turnOn
      }
    };
  }

  if (lower.includes('mute') || lower.includes('silence') || lower.includes('volume')) {
    const isMute = lower.includes('mute') || lower.includes('zero') || lower.includes('silence');
    return {
      rawInput,
      type: 'DEVICE_CONTROL',
      confidence: 0.9,
      spokenResponse: isMute ? "Media volume muted." : "Volume adjusted.",
      details: {
        deviceSetting: 'volume',
        settingValue: isMute ? 0 : 70
      }
    };
  }

  if (lower.includes('wifi') || lower.includes('wi-fi')) {
    const turnOn = !lower.includes('off');
    return {
      rawInput,
      type: 'DEVICE_CONTROL',
      confidence: 0.9,
      spokenResponse: turnOn ? "Wi-Fi enabled." : "Wi-Fi disabled.",
      details: {
        deviceSetting: 'wifi',
        settingValue: turnOn
      }
    };
  }

  // 8. ASSISTANT STATUS & QUERIES
  if (lower.includes('who are you') || lower.includes('what can you do') || lower.includes('help')) {
    return {
      rawInput,
      type: 'STATUS_QUERY',
      confidence: 0.98,
      spokenResponse: "I am Steffy, your custom offline Android assistant. I can make calls, send SMS, launch apps, browse files via SAF, and automate screen taps and swipes via Accessibility Services."
    };
  }

  if (lower.includes('time') || lower.includes('what time')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      rawInput,
      type: 'STATUS_QUERY',
      confidence: 0.95,
      spokenResponse: `The current time is ${timeStr}.`
    };
  }

  if (lower.includes('battery')) {
    return {
      rawInput,
      type: 'STATUS_QUERY',
      confidence: 0.95,
      spokenResponse: "Battery level is 84%, discharging normally."
    };
  }

  // Default fallback local processing
  return {
    rawInput,
    type: 'UNKNOWN',
    confidence: 0.3,
    spokenResponse: `Command received: '${rawInput}'. Processed locally via Steffy Offline Intent Router.`
  };
}
