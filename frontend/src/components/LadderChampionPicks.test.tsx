import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { I18nProvider } from "../i18n/I18nProvider";
import { LadderChampionPicks } from "./LadderChampionPicks";

afterEach(cleanup);

const champions = ["Ahri", "Ekko", "Garen"].map((championName, index) => ({
  championId: index + 1,
  championName,
  championImageUrl: `/assets/${championName}.png`,
  gamesPlayed: 2,
}));

it("holds all portraits behind the skeleton until every image settles", () => {
  const { container } = render(
    <I18nProvider>
      <LadderChampionPicks champions={champions} loading={false} />
    </I18nProvider>,
  );
  const [ahri, ekko, garen] = container.querySelectorAll("img");

  fireEvent.load(ahri!);
  fireEvent.load(ekko!);
  expect(container.querySelectorAll(".ladder-pick-skeleton")).toHaveLength(3);
  expect(screen.queryAllByRole("img")).toHaveLength(0);

  fireEvent.error(garen!);
  expect(container.querySelectorAll(".ladder-pick-skeleton")).toHaveLength(0);
  expect(screen.getAllByRole("img")).toHaveLength(3);
  expect(screen.getByRole("img", { name: "Garen" }).textContent).toBe("—");
});

it("shows three placeholder slots while waiting for picks and clears them for an empty response", () => {
  const { container, rerender } = render(
    <I18nProvider>
      <LadderChampionPicks champions={undefined} loading={true} />
    </I18nProvider>,
  );
  expect(container.querySelectorAll(".ladder-pick-skeleton")).toHaveLength(3);

  rerender(
    <I18nProvider>
      <LadderChampionPicks champions={[]} loading={false} />
    </I18nProvider>,
  );
  expect(container.querySelectorAll(".ladder-pick-skeleton")).toHaveLength(0);
  expect(screen.getByText("—")).toBeTruthy();
});
