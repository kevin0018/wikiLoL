import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../i18n/I18nProvider";
import { ComparePage } from "./ComparePage";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Matchups() {
  const [, setSearchParams] = useSearchParams();

  return (
    <>
      <button onClick={() => setSearchParams("a=ALPHA%23TAG&b=Charlie%23TAG")}>Second matchup</button>
      <button onClick={() => setSearchParams("a=Bravo%23TAG&b=Charlie%23TAG")}>Third matchup</button>
      <ComparePage />
    </>
  );
}

it("reuses each player's profile, ranks, and masteries when their opponent or side changes", async () => {
  const requests: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (request: string) => {
    const url = new URL(request, "http://localhost");
    const resource = url.pathname.split("/").pop();
    const gameName = url.searchParams.get("gameName");
    const player = gameName?.toLowerCase() ?? url.searchParams.get("puuid");
    requests.push(`${resource}:${player}`);

    if (resource === "profile") {
      return Response.json({
        gameName,
        tagLine: "TAG",
        region: "EUW",
        puuid: player,
        iconUrl: "/icon.png",
        summonerLevel: 100,
      });
    }
    return Response.json([]);
  }));

  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <MemoryRouter initialEntries={["/compare?a=Alpha%23TAG&b=Bravo%23TAG"]}>
          <Matchups />
        </MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>,
  );

  await waitFor(() => expect(requests).toHaveLength(6));
  fireEvent.click(screen.getByRole("button", { name: "Second matchup" }));
  await screen.findByRole("heading", { name: "Charlie" });
  await waitFor(() => expect(requests).toHaveLength(9));
  fireEvent.click(screen.getByRole("button", { name: "Third matchup" }));
  await screen.findByRole("heading", { name: "Bravo" });

  expect(requests.sort()).toEqual(
    ["mastery", "profile", "rank"].flatMap((resource) =>
      ["alpha", "bravo", "charlie"].map((player) => `${resource}:${player}`),
    ),
  );
});
