import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider } from "@/auth/AuthProvider";
import { DemoEnd } from "@/game/demo/DemoEnd";
import { BootScreen } from "@/game/shell/BootScreen";
import { Desktop } from "@/game/shell/Desktop";
import { EndGame } from "@/game/shell/EndGame";
import { GoodEnd } from "@/game/shell/GoodEnd";
import { usePhase } from "@/game/system/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virus Hunt — a safe practice PC" },
      {
        name: "description",
        content:
          "A retro 2000s PC in your browser: browse, chat, bank and email safely. Learn to spot scams without risking your real computer.",
      },
      { property: "og:title", content: "Virus Hunt" },
      {
        property: "og:description",
        content: "A retro 2000s PC in your browser for practising staying safe online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AuthProvider>
      <Game />
    </AuthProvider>
  );
}

function Game() {
  const phase = usePhase();
  if (phase === "end") return <EndGame />;
  if (phase === "goodend") return <GoodEnd />;
  if (phase === "demo-end") return <DemoEnd />;
  return phase === "desktop" ? <Desktop /> : <BootScreen />;
}
