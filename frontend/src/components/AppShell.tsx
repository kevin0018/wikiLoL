import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { CloseIcon, MenuIcon } from "./Icons";

const navigation = [
  { to: "/", label: "Buscador", end: true },
  { to: "/champions", label: "Campeones", end: false },
  { to: "/compare", label: "Comparar", end: false },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="site-header">
        <NavLink className="brand" to="/" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            W
          </span>
          <span className="brand-copy">
            <strong>wikiLoL</strong>
            <small>Archivo de Runaterra</small>
          </span>
        </NavLink>

        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav
          id="main-navigation"
          className={menuOpen ? "main-navigation is-open" : "main-navigation"}
          aria-label="Navegación principal"
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
        </nav>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <span className="utility-label">PROYECTO DE PORTFOLIO</span>
          <p>
            React, TypeScript y una API propia sobre datos oficiales de Riot.
          </p>
          <div className="footer-links">
            <NavLink to="/compare">Comparar jugadores</NavLink>
            <a
              href="https://github.com/kevin0018/wikiLoL"
              target="_blank"
              rel="noreferrer"
            >
              Ver código fuente
            </a>
          </div>
        </div>
        <p>
          wikiLoL no está afiliado, respaldado ni patrocinado por Riot Games.
        </p>
      </footer>
    </div>
  );
}
