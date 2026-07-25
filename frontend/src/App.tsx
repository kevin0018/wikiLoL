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
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </AppShell>
    </MotionConfig>
  );
}
