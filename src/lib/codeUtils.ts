/**
 * Utility functions for Partner Connection Codes
 * Standard format: 6-digit secure numeric code (e.g. 739214), with 15-minute expiration
 * Backwards-compatible with HER-XXXXXX legacy format
 */

export function generateSixDigitCode(): string {
  // Generate cryptographically random 6-digit number between 100000 and 999999
  const array = new Uint32Array(1);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Node.js fallback
    array[0] = Math.floor(Math.random() * 1000000000);
  }
  const num = 100000 + (array[0] % 900000);
  return String(num);
}

export async function hashPartnerCode(code: string): Promise<string> {
  const clean = code.trim().toUpperCase().replace(/\s+/g, '');
  const encoder = new TextEncoder();
  const data = encoder.encode(clean);
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simple hash for environments without Web Crypto
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

export function normalizePartnerCode(input: string): string {
  if (!input) return '';
  let clean = input.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  
  // If numeric 6-digit code
  if (/^\d{6}$/.test(clean)) {
    return clean;
  }

  // If starts with HER-
  if (clean.startsWith('HER-')) {
    return clean;
  }
  
  // If starts with HER without hyphen (e.g. HERABC123)
  if (clean.startsWith('HER') && clean.length > 3) {
    return `HER-${clean.slice(3)}`;
  }
  
  // If exactly 6 chars alphanumeric without prefix
  if (clean.length === 6 && !clean.includes('-')) {
    return clean;
  }
  
  return clean;
}

export function looksLikePartnerCode(input: string): boolean {
  if (!input) return false;
  const clean = input.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (/^\d{6}$/.test(clean)) return true;
  if (clean.startsWith('HER-') && clean.length >= 7) return true;
  if (clean.startsWith('HER') && clean.length >= 7) return true;
  if (/^[A-Z0-9]{6}$/.test(clean)) return true;
  return false;
}

export function formatPartnerCodeDisplay(input: string): string {
  const clean = normalizePartnerCode(input);
  if (/^\d{6}$/.test(clean)) {
    return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  }
  return clean;
}
