import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseUserCommand,
  extractPhoneNumber,
  findContactByName,
  DEFAULT_CONTACTS
} from './intentEngine.ts';

test('extractPhoneNumber extracts digits and plus sign', () => {
  assert.equal(extractPhoneNumber('+1 (555) 123-4567'), '+15551234567');
  assert.equal(extractPhoneNumber('Call 911 now!'), '911');
  assert.equal(extractPhoneNumber('abc'), '');
});

test('findContactByName finds contact case-insensitively', () => {
  const mom = findContactByName('mom');
  assert.ok(mom);
  assert.equal(mom?.name, 'Mom');

  const john = findContactByName('John');
  assert.ok(john);
  assert.equal(john?.phoneNumber, '+1 (555) 876-5432');

  const nonExistent = findContactByName('Zaphod');
  assert.equal(nonExistent, null);
});

test('parseUserCommand classifies phone call intents properly', () => {
  // Test contact name
  const intent1 = parseUserCommand('call mom');
  assert.equal(intent1.type, 'CALL');
  assert.equal(intent1.details?.contactName, 'Mom');
  assert.match(intent1.spokenResponse, /Calling Mom/);

  // Test direct phone number
  const intent2 = parseUserCommand('make a call to +15558889999');
  assert.equal(intent2.type, 'CALL');
  assert.equal(intent2.details?.phoneNumber, '+15558889999');
  assert.match(intent2.spokenResponse, /Calling \+15558889999 now/);
});

test('parseUserCommand classifies SMS intents and message content', () => {
  const intent = parseUserCommand('text mom saying on my way home');
  assert.equal(intent.type, 'SMS');
  assert.equal(intent.details?.contactName, 'Mom');
  assert.equal(intent.details?.smsMessage, 'on my way home');
  assert.match(intent.spokenResponse, /Sending SMS to Mom/);

  const intentNumber = parseUserCommand('send sms to 5551234 saying hello world');
  assert.equal(intentNumber.type, 'SMS');
  assert.equal(intentNumber.details?.phoneNumber, '5551234');
  assert.equal(intentNumber.details?.smsMessage, 'hello world');
});

test('parseUserCommand classifies app launch intents', () => {
  const ytIntent = parseUserCommand('open youtube');
  assert.equal(ytIntent.type, 'LAUNCH_APP');
  assert.equal(ytIntent.details?.packageName, 'com.google.android.youtube');

  const waIntent = parseUserCommand('launch whatsapp');
  assert.equal(waIntent.type, 'LAUNCH_APP');
  assert.equal(waIntent.details?.packageName, 'com.whatsapp');
});

test('parseUserCommand classifies accessibility click and swipe', () => {
  const swipeIntent = parseUserCommand('swipe down');
  assert.equal(swipeIntent.type, 'ACCESSIBILITY_SWIPE');
  assert.equal(swipeIntent.details?.swipeDirection, 'DOWN');

  const clickIntent = parseUserCommand('click "Subscribe"');
  assert.equal(clickIntent.type, 'ACCESSIBILITY_CLICK');
  assert.equal(clickIntent.details?.clickTarget, 'Subscribe');
});

test('parseUserCommand handles device controls and SAF', () => {
  const torchIntent = parseUserCommand('turn on flashlight');
  assert.equal(torchIntent.type, 'DEVICE_CONTROL');
  assert.equal(torchIntent.details?.deviceSetting, 'flashlight');
  assert.equal(torchIntent.details?.settingValue, true);

  const safIntent = parseUserCommand('open file picker');
  assert.equal(safIntent.type, 'SAF_PICKER');
});
