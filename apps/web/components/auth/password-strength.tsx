'use client';

import { validatePassword, PASSWORD_REQUIREMENTS, type PasswordValidation } from '~/lib/auth/password-validation';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const validation = validatePassword(password);

  if (!password) {
    return null;
  }

  // Calculate strength score (0-5)
  const metRequirements = Object.entries(validation)
    .filter(([key, value]) => key !== 'isValid' && value)
    .length;

  const getStrengthColor = () => {
    if (metRequirements <= 1) return 'bg-red-500';
    if (metRequirements <= 2) return 'bg-orange-500';
    if (metRequirements <= 3) return 'bg-yellow-500';
    if (metRequirements <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (metRequirements <= 1) return 'Weak';
    if (metRequirements <= 2) return 'Fair';
    if (metRequirements <= 3) return 'Good';
    if (metRequirements <= 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="mt-3 space-y-3 rounded-lg bg-slate-50 p-4">
      {/* Strength Meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700">Password strength</p>
          <p className={`text-xs font-bold ${
            validation.isValid ? 'text-green-600' : 'text-slate-600'
          }`}>
            {getStrengthLabel()}
          </p>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < metRequirements ? getStrengthColor() : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-slate-700">Requirements:</p>
        <div className="space-y-1.5">
          {PASSWORD_REQUIREMENTS.map((req) => {
            const isMet = validation[req.key as keyof PasswordValidation];
            return (
              <div key={req.key} className="flex items-center gap-2.5">
                <span
                  className={`inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isMet
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-300 text-slate-400'
                  }`}
                >
                  {isMet ? '✓' : '○'}
                </span>
                <span className={`text-xs font-medium transition-colors ${
                  isMet ? 'text-green-700' : 'text-slate-600'
                }`}>
                  {req.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
