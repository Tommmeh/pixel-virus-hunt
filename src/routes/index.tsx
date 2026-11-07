import { createFileRoute } from "@tanstack/react-router";
import { GameProvider, useGame } from "@/game/state";
import { Desktop } from "@/game/Desktop";
import { DebriefScreen, ScoreScreen, TitleScreen } from "@/game/Screens";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virus Hunt — Play. Get Infected. Stay Safe." },
      { name: "description", content: "A retro 2000s PC game that teaches cybersecurity by letting you get infected and hunt the malware." },
      { property: "og:title", content: "Virus Hunt" },
      { property: "og:description", content: "Make choices, get infected, hunt the malware, learn to stay safe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Game() {
  const { state } = useGame();
  if (state.phase === "title") return <TitleScreen />;
  if (state.phase === "debrief") return <DebriefScreen />;
  if (state.phase === "score") return <ScoreScreen />;
  return <Desktop />;
}

function Index() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
