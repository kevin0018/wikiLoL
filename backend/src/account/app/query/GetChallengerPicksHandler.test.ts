import { afterEach, expect, it, vi } from "vitest";
import { Region } from "../../domain/value-object/Region.js";
import {
  CHALLENGER_PICKS_TTL_SECONDS,
  GetChallengerPicksHandler,
} from "./GetChallengerPicksHandler.js";

afterEach(() => vi.restoreAllMocks());

const region = Region.from("EUW");
const champion = {
  championId: 103,
  championName: "Ahri",
  championImageUrl: "/api/assets/champion/Ahri.png",
  gamesPlayed: 3,
};

it("batches the top five and reuses each player across concurrent and reordered requests", async () => {
  const getMostPlayed = vi.fn().mockResolvedValue([champion]);
  const handler = new GetChallengerPicksHandler({ getMostPlayed });
  const players = ["one", "two", "three", "four", "five"];

  const [first, overlapping] = await Promise.all([
    handler.execute(players, region, "es_ES"),
    handler.execute(["two", "one"], region, "es_ES"),
  ]);

  expect(first).toEqual(Object.fromEntries(players.map((player) => [player, [champion]])));
  expect(overlapping).toEqual({ two: [champion], one: [champion] });
  await expect(handler.execute([...players].reverse(), region, "es_ES")).resolves.toEqual(first);
  expect(getMostPlayed).toHaveBeenCalledTimes(5);
  expect(getMostPlayed).toHaveBeenCalledWith("one", region, 5, 3, "es_ES");
});

it("retries incomplete results and refreshes expired player data", async () => {
  const now = Date.now();
  const clock = vi.spyOn(Date, "now").mockReturnValue(now);
  const getMostPlayed = vi.fn().mockRejectedValueOnce(new Error("Upstream unavailable"));
  getMostPlayed.mockResolvedValue([champion]);
  const handler = new GetChallengerPicksHandler({ getMostPlayed });

  await expect(handler.execute(["one"], region, "es_ES")).resolves.toEqual({ one: null });
  clock.mockReturnValue(now + 1_200);
  await expect(handler.execute(["one"], region, "es_ES")).resolves.toEqual({ one: [champion] });
  clock.mockReturnValue(now + 1_200 + CHALLENGER_PICKS_TTL_SECONDS * 1000);
  await handler.execute(["one"], region, "es_ES");

  expect(getMostPlayed).toHaveBeenCalledTimes(3);
});
