export const ALLOWED_STUDENT_EMAIL_DOMAINS = ["ucf.edu", "knights.ucf.edu"] as const;

const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getEmailDomain(email: string): string | null {
  const normalized = normalizeEmail(email);
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === normalized.length - 1) return null;
  return normalized.slice(atIndex + 1);
}

export function isAllowedStudentEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  return Boolean(
    domain && ALLOWED_STUDENT_EMAIL_DOMAINS.includes(domain as (typeof ALLOWED_STUDENT_EMAIL_DOMAINS)[number])
  );
}

export function getStudentEmailError(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized) return "Please enter your UCF email.";
  if (!SIMPLE_EMAIL_REGEX.test(normalized)) return "Please enter a valid email address.";
  if (!isAllowedStudentEmail(normalized)) {
    return "Knight Market is currently limited to verified UCF student emails.";
  }
  return null;
}
