// Mounted on the desktop while the tutorial (the guided demo) is running. Starts Scout's script; the last card,
// after the worm is cleaned, has a "Back to main menu" button.
import { useEffect } from "react";
import { TutorialGuide } from "../tutorial/TutorialGuide";
import { startTutorial } from "../tutorial/store";
import { DEMO_SCRIPT } from "./steps";
import { exitDemo } from "./store";

export function DemoGuide() {
  useEffect(() => {
    const t = setTimeout(() => startTutorial(DEMO_SCRIPT), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <TutorialGuide
      autoStart={false}
      skipLabel="Exit tutorial"
      onSkip={exitDemo}
      allowBack={false}
      finishLabel="Back to main menu"
      onFinish={exitDemo}
    />
  );
}
