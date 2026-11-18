import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePasswordStrength } from './passwordStrength';

test('evaluatePasswordStrength enforces all 5 enterprise password policy requirements', () => {
  const strong = evaluatePasswordStrength('K9#mQ$8xL!2v9Wp@');
  assert.equal(strong.minLength, true);
  assert.equal(strong.hasUpperAndLower, true);
  assert.equal(strong.hasDigit, true);
  assert.equal(strong.hasSpecial, true);
  assert.equal(strong.notPrevious, true);
  assert.equal(strong.allPassed, true);
  assert.equal(strong.strengthLabel, 'Strong');
  assert.equal(strong.segmentsFilled, 4);
  assert.ok(strong.entropyBits >= 72);
});

test('evaluatePasswordStrength flags weak short passwords and reused previous passwords', () => {
  const weak = evaluatePasswordStrength('abc123');
  assert.equal(weak.minLength, false);
  assert.equal(weak.allPassed, false);
  assert.equal(weak.strengthLabel, 'Weak');

  const reused = evaluatePasswordStrength('Northstar2024!');
  assert.equal(reused.notPrevious, false);
  assert.equal(reused.allPassed, false);
});
