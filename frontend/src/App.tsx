import { AnimatePresence, MotionConfig } from "motion/react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AccountPage } from "./pages/AccountPage";
import { ChampionPage } from "./pages/ChampionPage";
import { ChampionsPage } from "./pages/ChampionsPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  const location = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <AppShell>
        <AnimatePresence mode="wait">
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
