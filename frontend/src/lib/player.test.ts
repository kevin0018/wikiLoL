import { describe, expect, it } from "vitest";
import { parseRiotId } from "./player";

describe("parseRiotId", () => {
  it("separa un Riot ID completo", () => {
    expect(parseRiotId("Faker # KR1", "EUW")).toEqual({
      gameName: "Faker",
      tagLine: "KR1",
    });
  });

  it("utiliza la región cuando no hay tag", () => {
    expect(parseRiotId("Caps", "EUW")).toEqual({
      gameName: "Caps",
      tagLine: "EUW",
    });
  });

  it("rechaza entradas incompletas", () => {
    expect(parseRiotId("Faker#", "KR")).toBeNull();
  });
});
