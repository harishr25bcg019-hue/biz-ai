import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  Mail,
  MonitorSmartphone,
  RotateCcw,
  Shield,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { evaluatePasswordStrength } from '../utils/passwordStrength';

interface AccountRecoveryModalProps {
  open: boolean;
  defaultEmail: string;
  defaultName: string;
  onClose: () => void;
}

export function AccountRecoveryModal({
  open,
  defaultEmail,
  defaultName,
  onClose,
}: AccountRecoveryModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(defaultEmail || '');
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [deliveryNotice, setDeliveryNotice] = useState<string | null>(null);

  const [otp, setOtp] = useState<string[]>(['8', '4', '2', '', '', '']);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [newPassword, setNewPassword] = useState('K9#mQ$8xL!2v9Wp@');
  const [confirmPassword, setConfirmPassword] = useState('K9#mQ$8xL!2v9Wp@');
  const [showPassword, setShowPassword] = useState(false);
  const [revokeSessions, setRevokeSessions] = useState(true);
  const [resendSeconds, setResendSeconds] = useState(42);
  const [magicSeconds, setMagicSeconds] = useState(761);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  useEffect(() => {
    if (!open || step !== 2) return;
    const interval = setInterval(() => {
      setResendSeconds((s) => (s > 0 ? s - 1 : 0));
      setMagicSeconds((m) => (m > 0 ? m - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [open, step]);

  if (!open) return null;

  const strength = evaluatePasswordStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const otpComplete = otp.every((d) => /^\d$/.test(d));

  const formatMagicTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStep1Error('Please enter a valid corporate email address.');
      return;
    }
    setStep1Error(null);
    setStep(2);
  };

  const handleOtpChange = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = clean;
    setOtp(next);
    if (clean && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpComplete) {
      setStep2Error('Please enter the complete 6-digit security verification code.');
      return;
    }
    if (!strength.allPassed) {
      setStep2Error('Password must satisfy all enterprise security policy requirements.');
      return;
    }
    if (!passwordsMatch) {
      setStep2Error('Confirmation password does not match.');
      return;
    }
    setStep2Error(null);
    setStep(3);
  };

  const resetFlow = () => {
    setStep(1);
    setStep1Error(null);
    setStep2Error(null);
    setDeliveryNotice(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Account Recovery Portal"
      className="fixed inset-0 z-50 bg-[#faf8ff] flex flex-col overflow-y-auto text-[#131b2e]"
    >
      {/* Top Bar (Matching Screens 4 & 5) */}
      <header className="h-16 px-6 bg-white border-b border-[#e2e7ff] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#4648d4] text-white flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-semibold text-[15px] leading-tight text-[#131b2e]">
              Biz Assist
            </div>
            <div className="text-[11.5px] text-[#464554]">
              Smarter Support. Happier Customers.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[12.5px]">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2f3ff] text-[#4648d4] font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-[#131b2e] font-medium hover:text-[#4648d4]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setDeliveryNotice('Security Desk available 24/7 at secops@bizassist.io')
            }
            className="inline-flex items-center gap-1 text-[#464554] hover:text-[#131b2e]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help</span>
          </button>
        </div>
      </header>

      {/* Main Centered Split Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[1040px] bg-white border border-[#e2e7ff] rounded-2xl shadow-[0_20px_40px_-15px_rgba(70,72,212,0.12)] overflow-hidden">
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Indigo-Tinted Feature Panel */}
              <div className="lg:col-span-5 bg-[#f2f3ff] p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e1e0ff] text-[#4648d4] text-[10.5px] font-semibold tracking-wider uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Secure Account Recovery</span>
                  </span>
                  <h1 className="font-display text-[26px] font-semibold leading-tight text-[#131b2e]">
                    Protecting your support operations at every step.
                  </h1>
                  <p className="text-[13px] text-[#464554] leading-relaxed">
                    Biz Assist enforces zero-trust identity verification to prevent unauthorized privilege escalation and protect critical customer interactions.
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      {
                        icon: <Shield className="w-4 h-4 text-[#4648d4]" />,
                        title: 'Zero-Knowledge Reset',
                        desc: 'Cryptographically salted magic recovery tokens valid for precisely 15 minutes.',
                      },
                      {
                        icon: <MonitorSmartphone className="w-4 h-4 text-[#4648d4]" />,
                        title: 'Multi-Role Session Revocation',
                        desc: 'Automatically signs out any active unverified sessions across customer and staff portals.',
                      },
                      {
                        icon: <ClipboardList className="w-4 h-4 text-[#4648d4]" />,
                        title: 'Audit Logged',
                        desc: 'All recovery requests trigger real-time SIEM alerts and broadcast security admin notifications.',
                      },
                    ].map((card) => (
                      <div
                        key={card.title}
                        className="p-3.5 rounded-xl bg-white border border-[#e2e7ff] flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#f2f3ff] flex items-center justify-center shrink-0">
                          {card.icon}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-[#131b2e]">
                            {card.title}
                          </div>
                          <div className="text-[11.5px] text-[#464554] leading-snug mt-0.5">
                            {card.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-[#eaedff] text-[11.5px] text-[#464554]">
                    Need enterprise SSO help? Reach your organization workspace administrator for SAML/Okta bypass.
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-medium text-[#464554]">
                    <span className="px-2 py-1 rounded bg-white border border-[#e2e7ff]">SOC2 Type II</span>
                    <span className="px-2 py-1 rounded bg-white border border-[#e2e7ff]">GDPR Enforced</span>
                    <span className="px-2 py-1 rounded bg-white border border-[#e2e7ff]">AES-256 GCM</span>
                  </div>
                </div>
              </div>

              {/* Right Form Panel */}
              <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-wider text-[#4648d4] uppercase">
                      Step 1 of 2 — Identify Account
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-1 rounded-full bg-[#4648d4]" />
                      <span className="w-6 h-1 rounded-full bg-[#e2e7ff]" />
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display text-[28px] font-semibold text-[#131b2e]">
                      Forgot your password?
                    </h2>
                    <p className="text-[13.5px] text-[#464554] mt-1.5 leading-relaxed">
                      Enter your verified work email address below. We&apos;ll send an encrypted reset link and a 6-digit confirmation code.
                    </p>
                  </div>

                  {step1Error && (
                    <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-[12.5px]">
                      {step1Error}
                    </div>
                  )}

                  {deliveryNotice && (
                    <div className="p-3 rounded-lg bg-[#eaedff] text-[#2f2ebe] text-[12.5px]">
                      {deliveryNotice}
                    </div>
                  )}

                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-[12.5px] mb-1.5">
                        <label htmlFor="recovery-email" className="font-semibold text-[#131b2e]">
                          Work Email Address
                        </label>
                        <span className="text-[11px] text-[#464554]">Required</span>
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#767586] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="recovery-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#f2f3ff] border border-[#e2e7ff] text-[13.5px] text-[#131b2e] focus:outline-none focus:border-[#4648d4] focus:bg-white"
                        />
                      </div>
                      <p className="text-[11.5px] text-[#464554] mt-1.5">
                        Enter the corporate email associated with your Biz Assist workspace.
                      </p>
                    </div>

                    <div className="px-3.5 py-2.5 rounded-lg bg-[#f2f3ff] border border-[#e2e7ff] text-[12.5px] text-[#131b2e]">
                      <strong className="font-semibold">Account Scope:</strong> All roles supported (Customer, Support Staff, Admin)
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 rounded-lg bg-[#4648d4] hover:bg-[#383ab8] text-white text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Send Recovery Link &amp; Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="px-4 py-3 rounded-lg bg-[#f2f3ff] flex flex-wrap items-center justify-between gap-2 text-[12px]">
                    <span className="text-[#464554]">Having delivery delays?</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryNotice('SMS 6-digit fallback code queued to verified device.')}
                        className="font-semibold text-[#4648d4] hover:underline"
                      >
                        Resend via SMS
                      </button>
                      <span className="text-[#c7c4d7]">·</span>
                      <button
                        type="button"
                        onClick={() => setDeliveryNotice('Escalated recovery ticket logged for Support Desk.')}
                        className="text-[#464554] hover:text-[#131b2e]"
                      >
                        Contact Desk
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 text-center text-[12.5px] text-[#464554]">
                  Remembered your credentials?{' '}
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-semibold text-[#4648d4] hover:underline"
                  >
                    Sign In →
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Verification & Policy Panel */}
              <div className="lg:col-span-5 bg-[#f2f3ff] p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e1e0ff] text-[#4648d4] text-[10.5px] font-semibold tracking-wider uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Step 2 of 2 — Verification &amp; Reset</span>
                  </span>

                  <h1 className="font-display text-[26px] font-semibold leading-tight text-[#131b2e]">
                    Create a resilient, enterprise-grade password.
                  </h1>
                  <p className="text-[13px] text-[#464554] leading-relaxed">
                    Biz Assist protects mission-critical support workflows. Meet global infosec requirements to safeguard customer telemetry.
                  </p>

                  {/* User Identity Card */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#e2e7ff] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#4648d4] text-white font-semibold text-[13px] flex items-center justify-center shrink-0">
                      {(defaultName || 'SC')
                        .split(/\s+/)
                        .map((p) => p[0] ?? '')
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-[#131b2e] truncate">
                        {defaultName || 'Sarah Chen'}
                      </div>
                      <div className="text-[11.5px] text-[#464554] truncate">{email}</div>
                      <div className="text-[11px] font-medium text-[#4648d4] mt-0.5">
                        Verified Support Lead · Acme Corp
                      </div>
                    </div>
                  </div>

                  {/* Security Policy Verification Checklist */}
                  <div className="p-4 rounded-xl bg-white border border-[#e2e7ff] space-y-2.5">
                    <div className="text-[10.5px] font-semibold tracking-wider text-[#464554] uppercase">
                      Security Policy Verification
                    </div>
                    {[
                      { ok: strength.minLength, label: 'Minimum 12 characters (16+ recommended)' },
                      { ok: strength.hasUpperAndLower, label: 'At least one uppercase & lowercase letter' },
                      { ok: strength.hasDigit, label: 'At least one numeric digit (0-9)' },
                      { ok: strength.hasSpecial, label: 'At least one special symbol (!@#$%^&*)' },
                      { ok: strength.notPrevious, label: 'Cannot match previous 5 passwords' },
                    ].map((rule) => (
                      <div key={rule.label} className="flex items-center gap-2 text-[12px]">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            rule.ok
                              ? 'bg-[#e1e0ff] text-[#4648d4]'
                              : 'bg-[#f2f3ff] text-[#767586]'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5" />
                        </span>
                        <span className={rule.ok ? 'text-[#131b2e]' : 'text-[#464554]'}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="px-3.5 py-2.5 rounded-lg bg-[#e1e0ff]/70 flex items-center justify-between text-[12px]">
                    <span className="inline-flex items-center gap-1.5 text-[#131b2e] font-medium">
                      <Timer className="w-3.5 h-3.5 text-[#4648d4]" />
                      <span>Session Magic Token:</span>
                    </span>
                    <span className="font-mono-code font-semibold text-[#4648d4] tabular-nums">
                      {formatMagicTime(magicSeconds)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#464554]">
                  <span>SOC2 Type II</span>
                  <span>·</span>
                  <span>ISO/IEC 27001</span>
                  <span>·</span>
                  <span>TLS 1.3 Strict</span>
                </div>
              </div>

              {/* Right Verification & Reset Form */}
              <div className="lg:col-span-7 p-8 sm:p-10 space-y-5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-[#4648d4] hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Email</span>
                  </button>
                  <span className="text-[11px] font-mono-code text-[#464554]">
                    Multi-Factor Authentication · Step 2 of 2
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-[26px] font-semibold text-[#131b2e]">
                    Reset your password
                  </h2>
                  <p className="text-[13px] text-[#464554] mt-1">
                    Enter the 6-digit security code dispatched to your registered email, then define your replacement credentials.
                  </p>
                </div>

                {step2Error && (
                  <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-[12.5px]">
                    {step2Error}
                  </div>
                )}

                <form onSubmit={handleStep2Submit} className="space-y-4">
                  {/* 6-Digit Verification Code */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[12.5px] font-semibold text-[#131b2e]">
                        Verification Code
                      </label>
                      <span className="px-2 py-0.5 rounded bg-[#f2f3ff] font-mono-code text-[10.5px] text-[#4648d4]">
                        SMS / TOTP Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          placeholder="•"
                          aria-label={`Verification digit ${idx + 1}`}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-12 text-center font-display text-[18px] font-semibold rounded-lg bg-[#f2f3ff] border border-[#e2e7ff] text-[#131b2e] focus:outline-none focus:border-[#4648d4] focus:bg-white tabular-nums"
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11.5px]">
                      <span className="text-[#464554]">Didn&apos;t receive the authentication code?</span>
                      <button
                        type="button"
                        onClick={() => setResendSeconds(42)}
                        className="inline-flex items-center gap-1 font-medium text-[#4648d4] hover:underline tabular-nums"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>
                          {resendSeconds > 0
                            ? `Resend code in ${resendSeconds}s`
                            : 'Resend code now'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* New Enterprise Password */}
                  <div>
                    <label htmlFor="new-enterprise-pw" className="block text-[12.5px] font-semibold text-[#131b2e] mb-1.5">
                      New Enterprise Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#767586] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="new-enterprise-pw"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-11 pl-10 pr-10 rounded-lg bg-[#f2f3ff] border border-[#e2e7ff] font-mono-code text-[13px] text-[#131b2e] focus:outline-none focus:border-[#4648d4] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#464554] hover:text-[#131b2e]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Complexity Assessment */}
                    <div className="mt-2.5 p-2.5 rounded-lg bg-[#faf8ff] border border-[#e2e7ff] space-y-1.5">
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="text-[#464554]">Complexity Assessment</span>
                        <span className="font-semibold text-[#4648d4] tabular-nums">
                          {strength.strengthLabel} (Entropy: {strength.entropyBits} bits)
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((seg) => (
                          <div
                            key={seg}
                            className={`h-1.5 rounded-full transition-colors ${
                              seg <= strength.segmentsFilled ? 'bg-[#4648d4]' : 'bg-[#e2e7ff]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirm-enterprise-pw" className="block text-[12.5px] font-semibold text-[#131b2e] mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      id="confirm-enterprise-pw"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-[#f2f3ff] border border-[#e2e7ff] text-[13px] text-[#131b2e] focus:outline-none focus:border-[#4648d4] focus:bg-white"
                    />
                    {passwordsMatch && (
                      <div className="text-[11.5px] text-[#4648d4] font-medium mt-1">
                        ✓ Passwords match perfectly
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#f2f3ff] border border-[#e2e7ff] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={revokeSessions}
                      onChange={(e) => setRevokeSessions(e.target.checked)}
                      className="mt-0.5 rounded accent-[#4648d4]"
                    />
                    <span className="text-[12px] text-[#131b2e]">
                      <strong className="font-semibold block">
                        Log out of all other active browser sessions and mobile devices.
                      </strong>
                      <span className="text-[#464554]">
                        Recommended immediately if account recovery was triggered unexpectedly.
                      </span>
                    </span>
                  </label>

                  <div className="px-3.5 py-2.5 rounded-lg bg-[#f2f3ff] text-[11.5px] text-[#4648d4]">
                    Upon confirmation, active REST webhooks, API tokens, and user credentials will automatically re-synchronize.
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-[#4648d4] hover:bg-[#383ab8] text-white text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Reset Password &amp; Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="pt-2 flex items-center justify-between text-[11px] text-[#464554] font-mono-code">
                  <span>ID: SEC-2026-ACME-8911</span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-[#4648d4] font-sans font-semibold hover:underline"
                  >
                    Return to Workspace
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#e1e0ff] text-[#4648d4] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-display text-[24px] font-semibold text-[#131b2e]">
                Credentials rotated &amp; verified
              </h2>
              <p className="text-[13.5px] text-[#464554] leading-relaxed">
                Password for <strong className="text-[#131b2e]">{email}</strong> has been updated.{' '}
                {revokeSessions
                  ? 'All secondary browser and mobile sessions were revoked.'
                  : 'Existing sessions remain active.'}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetFlow}
                  className="px-4 py-2 rounded-lg border border-[#e2e7ff] text-[13px] font-medium text-[#464554] hover:bg-[#f2f3ff]"
                >
                  Run Another Check
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetFlow();
                    onClose();
                  }}
                  className="px-5 py-2 rounded-lg bg-[#4648d4] text-white text-[13px] font-semibold hover:bg-[#383ab8]"
                >
                  Return to ResolveDesk
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="px-6 py-4 bg-white border-t border-[#e2e7ff] flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-[#464554]">
        <span className="inline-flex items-center gap-1.5 font-medium text-[#131b2e]">
          <ShieldCheck className="w-4 h-4 text-[#4648d4]" />
          <span>SOC2 Certified &amp; ISO 27001 Compliant Platform</span>
        </span>
        <div className="flex items-center gap-4">
          <span>Privacy Policy</span>
          <span>·</span>
          <span>Terms of Service</span>
          <span>·</span>
          <span>System Status</span>
        </div>
      </footer>
    </div>
  );
}
