import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { CloseIcon, MenuIcon } from "./Icons";
import { useI18n } from "../i18n/I18nProvider";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const navigation = [
    { to: "/", label: t("nav.search"), end: true },
    { to: "/champions", label: t("nav.champions"), end: false },
    { to: "/compare", label: t("nav.compare"), end: false },
  ];

  return (
    <div className="site-shell">
      <header className="site-header">
        <NavLink className="brand" to="/" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            W
          </span>
          <span className="brand-copy">
            <strong>wikiLoL</strong>
            <small>{t("nav.brandSubtitle")}</small>
          </span>
        </NavLink>

        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? t("nav.close") : t("nav.open")}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav
          id="main-navigation"
          className={menuOpen ? "main-navigation is-open" : "main-navigation"}
          aria-label={t("nav.main")}
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "is-active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href="https://developer.riotgames.com/apis"
            target="_blank"
            rel="noreferrer"
          >
            Riot API
          </a>
          <div
            className="language-switcher"
            role="group"
            aria-label={t("language.label")}
          >
            <button
              type="button"
              lang="en"
              aria-label={t("language.english")}
              aria-pressed={language === "en"}
              className={language === "en" ? "is-active" : ""}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              lang="es"
              aria-label={t("language.spanish")}
              aria-pressed={language === "es"}
              className={language === "es" ? "is-active" : ""}
              onClick={() => setLanguage("es")}
            >
              ES
            </button>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <span className="utility-label">{t("footer.eyebrow")}</span>
          <p>{t("footer.summary")}</p>
          <div className="footer-links">
            <NavLink to="/compare">{t("footer.compare")}</NavLink>
            <a
              href="https://github.com/kevin0018/wikiLoL"
              target="_blank"
              rel="noreferrer"
            >
              {t("footer.source")}
            </a>
          </div>
        </div>
        <p>{t("footer.legal")}</p>
      </footer>
    </div>
  );
}
