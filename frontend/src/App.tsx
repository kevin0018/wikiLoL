import { AnimatePresence, MotionConfig } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { useI18n, type TranslationKey } from "./i18n/I18nProvider";
import { AccountPage } from "./pages/AccountPage";
import { ChampionPage } from "./pages/ChampionPage";
import { ChampionsPage } from "./pages/ChampionsPage";
import { ComparePage } from "./pages/ComparePage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  const location = useLocation();
  const { language, t } = useI18n();
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
    const metadata = routeMetadata(location.pathname, t);
    document.title = metadata.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", metadata.description);
    setMetaContent('meta[property="og:title"]', metadata.title);
    setMetaContent('meta[property="og:description"]', metadata.description);
    setMetaContent(
      'meta[property="og:locale"]',
      language === "es" ? "es_ES" : "en_US",
    );
    setMetaContent('meta[name="twitter:title"]', metadata.title);
    setMetaContent(
      'meta[name="twitter:description"]',
      metadata.description,
    );
  }, [language, location.pathname, t]);

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

function setMetaContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute("content", content);
}

function routeMetadata(
  pathname: string,
  t: (key: TranslationKey) => string,
) {
  if (pathname === "/compare") {
    return {
      title: t("meta.compare.title"),
      description: t("meta.compare.description"),
    };
  }
  if (pathname === "/champions" || pathname.startsWith("/champions/")) {
    return {
      title: t("meta.champions.title"),
      description: t("meta.champions.description"),
    };
  }
  if (pathname === "/account") {
    return {
      title: t("meta.account.title"),
      description: t("meta.account.description"),
    };
  }
  return {
    title: t("meta.home.title"),
    description: t("meta.home.description"),
  };
}
