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
  const fetchMock = vi.fn(async () => Response.json({ teams: [] }));
  vi.stubGlobal("fetch", fetchMock);
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
  const matches = ["Ahri", "Garen"].map((championName, index) => ({
    matchId: `EUW1_${index + 1}`,
    championName,
    championImageUrl: null,
    win: true,
    kills: 5,
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
  const selected = screen.getByRole("button", { name: /Open scoreboard: Garen/ });
  fireEvent.click(selected);
  await screen.findByText("No scoreboard is available for this match.");
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/account/matches/EUW1_2?region=EUW&locale=en_US");

  fireEvent.click(screen.getByRole("button", { name: "Close scoreboard" }));
  expect(document.activeElement).toBe(selected);
  fireEvent.click(selected);
  await screen.findByRole("dialog");
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("renders all twenty matches and appends an older page only when requested", async () => {
  const matches = Array.from({ length: 20 }, (_, index) => ({
    matchId: `EUW1_${index + 1}`,
    championName: "Ahri",
    championImageUrl: null,
    win: true,
    kills: 5,
    deaths: 2,
    assists: 10,
    queueId: 420,
    durationSeconds: 1500,
    startedAt: 0,
  }));
  const olderMatch = { ...matches[0], matchId: "EUW1_21", championName: "Garen" };
  const fetchMock = vi.fn(async () => Response.json({ matches: [matches[19], olderMatch], nextStart: null }));
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
  fireEvent.click(screen.getByRole("button", { name: "Show more" }));
  await screen.findByRole("button", { name: /Open scoreboard: Garen/ });
  expect(screen.getAllByRole("button", { name: /Open scoreboard:/ })).toHaveLength(21);
  expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/account/activity/matches?puuid=player&region=EUW&locale=en_US&start=20");
});
