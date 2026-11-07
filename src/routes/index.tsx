import { createFileRoute } from "@tanstack/react-router";
import { GameProvider, useGame } from "@/game/state";
import { Desktop } from "@/game/Desktop";
import { TitleScreen } from "@/game/Screens";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virus Hunt — Get Infected. Collect Them All. Stay Safe." },
      {
        name: "description",
        content:
          "A retro 2000s PC sandbox where every scam you fall for unlocks an achievement. Learn the tricks safely.",
      },
      { property: "og:title", content: "Virus Hunt" },
      {
        property: "og:description",
        content:
          "Fall for every scam on a fake PC, collect the achievements, stay safe on your real one.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Game() {
  const { state } = useGame();
  return state.phase === "title" ? <TitleScreen /> : <Desktop />;
}

function Index() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
