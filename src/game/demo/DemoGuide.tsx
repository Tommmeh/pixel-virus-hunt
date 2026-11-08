// Mounted on the desktop instead of the normal tutorial while the guided demo is running.
// Starts Scout's demo script, and shows the ending a moment after the worm is removed.
import { useEffect, useState } from "react";
import { STORY } from "../storylines/aaron/story";
import { useSystemEvent } from "../system/events";
import { TutorialGuide } from "../tutorial/TutorialGuide";
import { startTutorial } from "../tutorial/store";
import { DEMO_SCRIPT } from "./steps";
import { exitDemo, finishDemo } from "./store";

/** Let the "your PC is clean" moment land before the ending screen. */
const END_DELAY_MS = 2500;

export function DemoGuide() {
  const [cleaned, setCleaned] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => startTutorial(DEMO_SCRIPT), 900);
    return () => clearTimeout(t);
  }, []);

  useSystemEvent((e) => {
    if (e.type === "story.complete" && e.story === STORY) setCleaned(true);
  });

  useEffect(() => {
    if (!cleaned) return;
    const t = setTimeout(finishDemo, END_DELAY_MS);
    return () => clearTimeout(t);
  }, [cleaned]);

  return (
    <TutorialGuide autoStart={false} skipLabel="Exit demo" onSkip={exitDemo} allowBack={false} />
  );
}
