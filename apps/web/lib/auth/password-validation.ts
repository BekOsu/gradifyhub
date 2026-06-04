export interface PasswordValidation {
  isValid: boolean;
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    isValid:
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
}

export const PASSWORD_REQUIREMENTS = [
  { key: "minLength", label: "Minimum 12 characters" },
  { key: "hasUppercase", label: "At least 1 uppercase letter (A-Z)" },
  { key: "hasLowercase", label: "At least 1 lowercase letter (a-z)" },
  { key: "hasNumber", label: "At least 1 number (0-9)" },
  { key: "hasSpecial", label: "At least 1 special character (!@#$%^&*)" },
] as const;
