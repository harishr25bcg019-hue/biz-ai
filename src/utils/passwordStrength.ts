export interface PasswordPolicyResult {
  minLength: boolean;
  hasUpperAndLower: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  notPrevious: boolean;
  allPassed: boolean;
  entropyBits: number;
  strengthLabel: 'Weak' | 'Fair' | 'Good' | 'Strong';
  segmentsFilled: number;
}

const PREVIOUS_PASSWORDS = ['Northstar2024!', 'ResolveDesk#1', 'AdminPass99$', 'SupportLead2025@', 'BizAssist!00'];

export function evaluatePasswordStrength(password: string): PasswordPolicyResult {
  const minLength = password.length >= 12;
  const hasUpperAndLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`]/.test(password);
  const notPrevious = password.length > 0 && !PREVIOUS_PASSWORDS.includes(password);

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/\d/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;

  const entropyBits =
    password.length === 0 || poolSize === 0
      ? 0
      : Math.round(password.length * Math.log2(poolSize));

  let strengthLabel: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  let segmentsFilled = 1;
  if (password.length === 0) {
    segmentsFilled = 0;
  } else if (entropyBits >= 72 && minLength && hasUpperAndLower && hasDigit && hasSpecial) {
    strengthLabel = 'Strong';
    segmentsFilled = 4;
  } else if (entropyBits >= 50) {
    strengthLabel = 'Good';
    segmentsFilled = 3;
  } else if (entropyBits >= 32) {
    strengthLabel = 'Fair';
    segmentsFilled = 2;
  }

  return {
    minLength,
    hasUpperAndLower,
    hasDigit,
    hasSpecial,
    notPrevious,
    allPassed: minLength && hasUpperAndLower && hasDigit && hasSpecial && notPrevious,
    entropyBits,
    strengthLabel,
    segmentsFilled,
  };
}
