export function parseRiotId(
  value: string,
  fallbackTag: string,
): { gameName: string; tagLine: string } | null {
  const normalized = value.trim();
  if (!normalized) return null;

  const separatorIndex = normalized.lastIndexOf("#");
  if (separatorIndex === -1) {
    return { gameName: normalized, tagLine: fallbackTag };
  }

  const gameName = normalized.slice(0, separatorIndex).trim();
  const tagLine = normalized.slice(separatorIndex + 1).trim();
  return gameName && tagLine ? { gameName, tagLine } : null;
}
