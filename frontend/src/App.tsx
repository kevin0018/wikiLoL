import { AnimatePresence, MotionConfig } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AccountPage } from "./pages/AccountPage";
import { ChampionPage } from "./pages/ChampionPage";
import { ChampionsPage } from "./pages/ChampionsPage";
import { ComparePage } from "./pages/ComparePage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef(new Map<string, number>());
  const pendingScrollPosition = useRef(0);
  const restoreFrame = useRef<number | null>(null);

  useLayoutEffect(() => {
    pendingScrollPosition.current =
      navigationType === "POP"
        ? (scrollPositions.current.get(location.key) ?? 0)
        : 0;

    return () => {
      scrollPositions.current.set(location.key, window.scrollY);
    };
  }, [location.key, navigationType]);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
      if (restoreFrame.current !== null) {
        cancelAnimationFrame(restoreFrame.current);
      }
    };
  }, []);

  useEffect(() => {
    const metadata = routeMetadata(location.pathname);
    document.title = metadata.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", metadata.description);
  }, [location.pathname]);

  const restoreScrollAfterTransition = () => {
    if (restoreFrame.current !== null) {
      cancelAnimationFrame(restoreFrame.current);
    }
    const target = pendingScrollPosition.current;
    let attempts = 0;

    const restoreWhenReady = () => {
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      if (maxScroll >= target || attempts >= 60) {
        window.scrollTo(0, Math.min(target, maxScroll));
        restoreFrame.current = null;
        return;
      }
      attempts += 1;
      restoreFrame.current = requestAnimationFrame(restoreWhenReady);
    };

    restoreFrame.current = requestAnimationFrame(restoreWhenReady);
  };

  return (
    <MotionConfig reducedMotion="user">
      <AppShell>
        <AnimatePresence
          mode="wait"
          onExitComplete={restoreScrollAfterTransition}
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/champions" element={<ChampionsPage />} />
            <Route path="/champions/:championId" element={<ChampionPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </AppShell>
    </MotionConfig>
  );
}

function routeMetadata(pathname: string) {
  if (pathname === "/compare") {
    return {
      title: "Comparar jugadores — wikiLoL",
      description:
        "Compara clasificación, rendimiento y maestrías de dos jugadores de League of Legends.",
    };
  }
  if (pathname === "/champions" || pathname.startsWith("/champions/")) {
    return {
      title: "Archivo de campeones — wikiLoL",
      description:
        "Consulta lore, roles y aspectos del archivo de campeones de League of Legends.",
    };
  }
  if (pathname === "/account") {
    return {
      title: "Perfil de jugador — wikiLoL",
      description:
        "Consulta rangos, maestrías y campeones recientes de un Riot ID.",
    };
  }
  return {
    title: "wikiLoL — Archivo competitivo de Runaterra",
    description:
      "Consulta perfiles, rangos, maestrías y campeones de League of Legends.",
  };
}
