import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../i18n/I18nProvider";
import { RecentMatchHistory } from "./RecentMatchHistory";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});

it("loads only the selected scoreboard and reuses it when reopened", async () => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement) { this.open = true; },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement) { this.open = false; },
    },
  });
  const fetchMock = vi.fn(async () => Response.json({
    teams: [{
      teamId: 100, win: true, kills: 5,
      players: [{
        championName: "Garen", championImageUrl: null, playerName: "Player", tagLine: "EUW",
        kills: 5, deaths: 2, assists: 10, damage: 23456, gold: 12000, farm: 212, items: [],
      }],
    }, {
      teamId: 200, win: false, kills: 0, players: [],
    }],
  }));
  vi.stubGlobal("fetch", fetchMock);
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
  const matches = ["Ahri", "Garen"].map((championName, index) => ({
    matchId: `EUW1_${index + 1}`,
    championName,
    championImageUrl: null,
    farm: 197,
    killParticipation: 68,
    itemImageUrls: ["/api/assets/item/16.23.1/3157.png", null, null, null, null, null, null],
    win: true,
    kills: 5,
    largestMultiKill: index === 1 ? 5 : 1,
    deaths: 2,
    assists: 10,
    queueId: 420,
    durationSeconds: 1500,
    startedAt: 0,
  }));
  render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <RecentMatchHistory
          matches={matches}
          nextStart={null}
          puuid="player"
          region="EUW"
          playerName="Player"
          tagLine="EUW"
          loading={false}
          error={false}
          retry={() => {}}
        />
      </I18nProvider>
    </QueryClientProvider>,
  );

  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: /Open scoreboard: Ahri/ }).querySelector(".match-multikill")).toBeNull();
  const selected = screen.getByRole("button", { name: /Open scoreboard: Garen.*Pentakill.*CS 197.*Kill participation 68%/ });
  expect(selected.querySelector(".match-build img")?.getAttribute("src")).toBe("/api/assets/item/16.23.1/3157.png");
  fireEvent.click(selected);
  await screen.findByRole("table", { name: "Match scoreboard" });
  expect(screen.getAllByRole("columnheader")).toHaveLength(6);
  expect(screen.getByRole("cell", { name: "23,456" })).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/account/matches/EUW1_2?region=EUW&locale=en_US");

  fireEvent.click(screen.getByRole("button", { name: "Close scoreboard" }));
  expect(document.activeElement).toBe(selected);
  fireEvent.click(selected);
  await screen.findByRole("dialog");
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("replaces the visible page and reuses it on back-and-forward navigation", async () => {
  const matches = Array.from({ length: 20 }, (_, index) => ({
    matchId: `EUW1_${index + 1}`,
    championName: "Ahri",
    championImageUrl: null,
    farm: null,
    killParticipation: null,
    itemImageUrls: [],
    win: true,
    kills: 5,
    largestMultiKill: 0,
    deaths: 2,
    assists: 10,
    queueId: 420,
    durationSeconds: 1500,
    startedAt: 0,
  }));
  const olderMatches = matches.map((match, index) => ({
    ...match,
    matchId: `EUW1_${index + 21}`,
    championName: "Garen",
    largestMultiKill: index === 0 ? 3 : 0,
  }));
  const fetchMock = vi.fn(async () => Response.json({ matches: olderMatches, nextStart: null }));
  vi.stubGlobal("fetch", fetchMock);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <I18nProvider>
        <RecentMatchHistory
          matches={matches}
          nextStart={20}
          puuid="player"
          region="EUW"
          playerName="Player"
          tagLine="EUW"
          loading={false}
          error={false}
          retry={() => {}}
        />
      </I18nProvider>
    </QueryClientProvider>,
  );

  expect(screen.getAllByRole("button", { name: /Open scoreboard: Ahri/ })).toHaveLength(20);
  expect(fetchMock).not.toHaveBeenCalled();
  const previous = screen.getByRole<HTMLButtonElement>("button", { name: "Previous" });
  const next = screen.getByRole<HTMLButtonElement>("button", { name: "Next" });
  expect(previous.disabled).toBe(true);
  fireEvent.click(next);
  await screen.findByText("Page 2");
  expect(screen.getByRole("button", { name: /Garen.*Triple kill/ })).toBeTruthy();
  expect(screen.getAllByRole("button", { name: /Open scoreboard: Garen/ })).toHaveLength(20);
  expect(screen.queryByRole("button", { name: /Open scoreboard: Ahri/ })).toBeNull();
  expect(next.disabled).toBe(true);
  expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Match history" }));

  fireEvent.click(previous);
  expect(screen.getAllByRole("button", { name: /Open scoreboard: Ahri/ })).toHaveLength(20);
  fireEvent.click(next);
  expect(screen.getAllByRole("button", { name: /Open scoreboard: Garen/ })).toHaveLength(20);
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/account/activity/matches?puuid=player&region=EUW&locale=en_US&start=20");
});
