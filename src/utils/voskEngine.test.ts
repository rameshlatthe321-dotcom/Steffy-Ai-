import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseVoskResult,
  parseVoskPartialResult,
  createVoskResultJson
} from './voskEngine.ts';

test('parseVoskResult parses valid Vosk JSON with word timestamps', () => {
  const jsonStr = JSON.stringify({
    text: 'call mom',
    result: [
      { conf: 0.98, start: 0.1, end: 0.5, word: 'call' },
      { conf: 0.94, start: 0.6, end: 1.0, word: 'mom' }
    ]
  });

  const parsed = parseVoskResult(jsonStr);
  assert.equal(parsed.text, 'call mom');
  assert.equal(parsed.confidence, 0.96);
  assert.equal(parsed.words.length, 2);
  assert.equal(parsed.words[0].word, 'call');
});

test('parseVoskResult handles simple text JSON without word results', () => {
  const jsonStr = JSON.stringify({ text: 'open youtube' });
  const parsed = parseVoskResult(jsonStr);
  assert.equal(parsed.text, 'open youtube');
  assert.ok(parsed.confidence > 0.8);
});

test('parseVoskPartialResult extracts partial transcript', () => {
  const jsonStr = JSON.stringify({ partial: 'turn on flash' });
  const partial = parseVoskPartialResult(jsonStr);
  assert.equal(partial, 'turn on flash');
});

test('createVoskResultJson generates valid Vosk payload', () => {
  const json = createVoskResultJson('text john saying hello', 0.95);
  const reParsed = parseVoskResult(json);
  assert.equal(reParsed.text, 'text john saying hello');
  assert.equal(reParsed.confidence, 0.95);
  assert.equal(reParsed.words.length, 4);
});
