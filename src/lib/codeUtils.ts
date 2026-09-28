/**
 * Utility functions for Partner Connection Codes
 * Standard format: HER-XXXXXX (6 alphanumeric uppercase characters)
 */

export function normalizePartnerCode(input: string): string {
  if (!input) return '';
  // Remove all whitespace, non-alphanumeric except hyphens
  let clean = input.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  
  // If already starts with HER-
  if (clean.startsWith('HER-')) {
    return clean;
  }
  
  // If starts with HER without hyphen (e.g. HERABC123)
  if (clean.startsWith('HER') && clean.length > 3) {
    return `HER-${clean.slice(3)}`;
  }
  
  // If exactly 6 chars without HER prefix (e.g. ABC123)
  if (clean.length === 6 && !clean.includes('-')) {
    return `HER-${clean}`;
  }
  
  return clean;
}

export function looksLikePartnerCode(input: string): boolean {
  if (!input) return false;
  const clean = input.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (clean.startsWith('HER-') && clean.length >= 7) return true;
  if (clean.startsWith('HER') && clean.length >= 7) return true;
  if (/^[A-Z0-9]{6}$/.test(clean)) return true;
  return false;
}

export function formatPartnerCodeForDisplay(input: string): string {
  return normalizePartnerCode(input);
}
