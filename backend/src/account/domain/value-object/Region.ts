export const REGION_CODES = [
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
] as const;

export type RegionCode = (typeof REGION_CODES)[number];

export class Region {
  private constructor(public readonly value: RegionCode) {}

  static from(value: string): Region {
    const normalized = value.toUpperCase();
    if (!REGION_CODES.includes(normalized as RegionCode)) {
      throw new Error(`Región no válida: ${value}`);
    }
    return new Region(normalized as RegionCode);
  }

  equals(other: Region): boolean {
    return this.value === other.value;
  }
}
