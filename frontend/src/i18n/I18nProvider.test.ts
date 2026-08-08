import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement, Fragment } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { I18nProvider, resolveLanguage, useI18n } from "./I18nProvider";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("resolveLanguage", () => {
  it("prioritizes a stored preference", () => {
    expect(resolveLanguage("en", ["es-ES"])).toBe("en");
  });

  it("detects Spanish from the browser language list", () => {
    expect(resolveLanguage(null, ["ca-ES", "es-ES", "en-US"])).toBe("es");
  });

  it("falls back to English for unsupported languages", () => {
    expect(resolveLanguage(null, ["fr-FR", "de-DE"])).toBe("en");
  });

  it("changes language and persists the manual preference", async () => {
    window.localStorage.setItem("wikilol-language", "es");

    render(createElement(I18nProvider, null, createElement(LanguageProbe)));

    expect(screen.getByText("Buscador")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "switch-to-en" }));

    expect(screen.getByText("Search")).toBeTruthy();
    await waitFor(() => {
      expect(window.localStorage.getItem("wikilol-language")).toBe("en");
      expect(document.documentElement.lang).toBe("en");
    });
  });
});

function LanguageProbe() {
  const { setLanguage, t } = useI18n();

  return createElement(
    Fragment,
    null,
    createElement("span", null, t("nav.search")),
    createElement(
      "button",
      { type: "button", onClick: () => setLanguage("en") },
      "switch-to-en",
    ),
  );
}
