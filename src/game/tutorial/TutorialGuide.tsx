// Scout's tutorial overlay (mounted in shell/Desktop.tsx). Speech balloon + spotlight on the current target.
// The spotlight never blocks clicks, so the player can always use the highlighted thing.
import { useEffect, useState } from "react";
import { useSystemEvent } from "../system/events";
import { personalize } from "../system/profile";
import { useSettings } from "../system/settings";
import { Scout } from "./Scout";
import {
  finishTutorial,
  nextStep,
  prevStep,
  skipTutorial,
  startTutorial,
  stepsFor,
  tutorialProgress,
  tutorialSession,
} from "./store";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Live position of the step's `data-tour` element (re-measured so it follows windows being moved).
 * A step may list several targets: the first one on screen that the player hasn't clicked yet wins
 * (e.g. "Full Scan", then "Remove threats" once the scan has found something).
 * Once the player engages with a target (clicks into it or types in it) or `dismissed` is set, its
 * spotlight goes away for the rest of the step, so it never gets in the way while they're typing.
 * (Focus alone doesn't count, because fields like the password box autofocus when the page loads.)
 */
function useTargetRect(
  target: string | readonly string[] | undefined,
  dismissed: boolean,
): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);
  const key = target === undefined ? "" : typeof target === "string" ? target : target.join("|");
  useEffect(() => {
    const targets = key ? key.split("|") : [];
    if (!targets.length || dismissed) {
      setRect(null);
      return;
    }
    const engaged = new Set<string>();
    const find = (t: string) => document.querySelector(`[data-tour="${t}"]`);
    const onInteract = (e: Event) => {
      if (!(e.target instanceof Node)) return;
      for (const t of targets) {
        if (find(t)?.contains(e.target)) engaged.add(t);
      }
      measure();
    };
    const measure = () => {
      for (const t of targets) {
        if (engaged.has(t)) continue;
        const el = find(t);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        setRect((prev) =>
          prev && prev.x === r.left && prev.y === r.top && prev.w === r.width && prev.h === r.height
            ? prev
            : { x: r.left, y: r.top, w: r.width, h: r.height },
        );
        return;
      }
      setRect(null);
    };
    measure();
    const t = setInterval(measure, 200);
    const events = ["pointerdown", "keydown"] as const; // not focus: fields may autofocus on load
    events.forEach((ev) => document.addEventListener(ev, onInteract, true));
    return () => {
      clearInterval(t);
      events.forEach((ev) => document.removeEventListener(ev, onInteract, true));
    };
  }, [key, dismissed]);
  return rect;
}

interface GuideProps {
  /** Start the intro tour by itself on first login. Off for the guided demo, which starts its own script. */
  autoStart?: boolean;
  /** The skip link, e.g. "Exit demo". */
  skipLabel?: string;
  onSkip?: () => void;
  /** Show a Back button on read-only steps. */
  allowBack?: boolean;
}

export function TutorialGuide({
  autoStart = true,
  skipLabel = "Skip tutorial",
  onSkip = skipTutorial,
  allowBack = true,
}: GuideProps = {}) {
  const session = tutorialSession.use();
  const name = useSettings().userName; // re-render when the player's name changes
  const steps = stepsFor(session.script);
  const step = session.active ? steps[session.step] : undefined;
  // Pressing a helper button (e.g. "Show me" → Notepad) means the player is busy: hide the spotlight.
  const [dismissedStep, setDismissedStep] = useState<string | null>(null);
  const rect = useTargetRect(step?.target, dismissedStep === step?.id);
  const say = (t: string) => personalize(t, name);

  // First login: Scout pops up by himself (once ever, until the PC is reset).
  useEffect(() => {
    if (!autoStart || tutorialProgress.get().done || tutorialSession.get().active) return;
    const t = setTimeout(() => {
      if (!tutorialProgress.get().done) startTutorial();
    }, 1200);
    return () => clearTimeout(t);
  }, [autoStart]);

  // "Do it yourself" steps finish when the player does the thing.
  useSystemEvent((e) => {
    const s = tutorialSession.get();
    const current = s.active ? stepsFor(s.script)[s.step] : undefined;
    if (current?.waitFor?.(e)) nextStep();
  });

  if (!step) return null;
  const last = session.step === steps.length - 1;
  const pad = 6;

  return (
    <>
      {rect && (
        <div
          // Hands-on steps get a plain outline (no dimming) so other windows like Notepad stay readable.
          className={`tour-spot ${step.waitFor ? "is-soft" : ""}`}
          style={{
            left: rect.x - pad,
            top: rect.y - pad,
            width: rect.w + pad * 2,
            height: rect.h + pad * 2,
          }}
          aria-hidden
        />
      )}
      <div className="scout-box" role="dialog" aria-label="Tutorial">
        <div className="nes-balloon from-right scout-balloon">
          <p className="scout-title">{say(step.title)}</p>
          {step.text.map((t) => (
            <p key={t}>{say(t)}</p>
          ))}
          {step.waitFor && step.hint && <p className="scout-hint">▶ {step.hint}</p>}
          <div className="scout-actions">
            <button className="link-btn scout-skip" onClick={onSkip}>
              {skipLabel}
            </button>
            <span className="scout-count">
              {session.step + 1}/{steps.length}
            </span>
            {allowBack && session.step > 0 && !step.waitFor && (
              <button className="nes-btn is-small" onClick={prevStep}>
                Back
              </button>
            )}
            {step.action && (
              <button
                className="nes-btn is-small is-warning"
                onClick={() => {
                  setDismissedStep(step.id);
                  step.action!.run();
                }}
              >
                {step.action.label}
              </button>
            )}
            {!step.waitFor && (
              <button
                className={`nes-btn is-small ${last ? "is-success" : "is-primary"}`}
                onClick={last ? finishTutorial : nextStep}
              >
                {last ? "Let's go!" : "Next"}
              </button>
            )}
          </div>
        </div>
        <div className="scout-sprite">
          <Scout cheer={last} />
        </div>
      </div>
    </>
  );
}
