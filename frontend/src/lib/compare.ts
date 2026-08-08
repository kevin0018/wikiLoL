import type { PlayerLookup, Region } from "@wikilol/contracts";
import { parseRiotId } from "./player";

export interface ComparisonSide {
  riotId: string;
  region: Region;
}

export interface ComparisonDraft {
  left: ComparisonSide;
  right: ComparisonSide;
}

export const emptyComparison: ComparisonDraft = {
  left: { riotId: "", region: "EUW" },
  right: { riotId: "", region: "EUW" },
};

export function comparisonFromSearchParams(
  searchParams: URLSearchParams,
): ComparisonDraft {
  return {
    left: {
      riotId: searchParams.get("a") ?? "",
      region: parseRegion(searchParams.get("ar")),
    },
    right: {
      riotId: searchParams.get("b") ?? "",
      region: parseRegion(searchParams.get("br")),
    },
  };
}

export function comparisonToSearchParams(draft: ComparisonDraft): URLSearchParams {
  return new URLSearchParams({
    a: draft.left.riotId.trim(),
    ar: draft.left.region,
    b: draft.right.riotId.trim(),
    br: draft.right.region,
  });
}

export function lookupFromComparisonSide(
  side: ComparisonSide,
): PlayerLookup | null {
  const riotId = parseRiotId(side.riotId, side.region);
  return riotId ? { ...riotId, region: side.region } : null;
}

function parseRegion(value: string | null): Region {
  const regions: Region[] = [
    "EUW",
    "EUNE",
    "NA",
    "LAN",
    "LAS",
    "KR",
    "JP",
    "BR",
    "OCE",
    "TR",
    "RU",
  ];
  return regions.find((region) => region === value) ?? "EUW";
}
