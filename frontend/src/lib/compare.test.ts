import { describe, expect, it } from "vitest";
import {
  comparisonFromSearchParams,
  comparisonToSearchParams,
  lookupFromComparisonSide,
} from "./compare";

describe("comparison search params", () => {
  it("recupera una comparación compartida", () => {
    const comparison = comparisonFromSearchParams(
      new URLSearchParams("a=Faker%23KR1&ar=KR&b=Caps%23EUW&br=EUW"),
    );

    expect(comparison).toEqual({
      left: { riotId: "Faker#KR1", region: "KR" },
      right: { riotId: "Caps#EUW", region: "EUW" },
    });
  });

  it("normaliza la comparación antes de compartirla", () => {
    const params = comparisonToSearchParams({
      left: { riotId: " Faker#KR1 ", region: "KR" },
      right: { riotId: " Caps#EUW ", region: "EUW" },
    });

    expect(params.get("a")).toBe("Faker#KR1");
    expect(params.get("b")).toBe("Caps#EUW");
  });
});

describe("lookupFromComparisonSide", () => {
  it("convierte un Riot ID en una consulta validada", () => {
    expect(
      lookupFromComparisonSide({ riotId: "Faker#KR1", region: "KR" }),
    ).toEqual({ gameName: "Faker", tagLine: "KR1", region: "KR" });
  });

  it("rechaza un Riot ID incompleto", () => {
    expect(
      lookupFromComparisonSide({ riotId: "Faker#", region: "KR" }),
    ).toBeNull();
  });
});
