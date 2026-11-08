// Scout's tutorial overlay (mounted in shell/Desktop.tsx). Speech balloon + spotlight on the current target.
// The spotlight never blocks clicks, so the player can always use the highlighted thing.
import { useEffect, useState } from "react";
import { useSystemEvent } from "../system/events";
import { personalize } from "../system/profile";
import { useSettings } from "../system/settings";
import { Scout } from "./Scout";
import { STEPS } from "./steps";
import {
  finishTutorial,
  nextStep,
  prevStep,
  skipTutorial,
  startTutorial,
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
 * Live position of a `data-tour` element (re-measured so it follows windows being moved).
 * Once the player engages with it (clicks into it or types in it) or `dismissed` is set, the spotlight
 * goes away for the rest of the step, so it never gets in the way while they're typing or checking Notepad.
 * (Focus alone doesn't count, because fields like the password box autofocus when the page loads.)
 */
function useTargetRect(target: string | undefined, dismissed: boolean): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);
  useEffect(() => {
    if (!target || dismissed) {
      setRect(null);
      return;
    }
    let engaged = false;
    const inTarget = (e: Event) => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      return !!el && e.target instanceof Node && el.contains(e.target);
    };
    const onInteract = (e: Event) => {
      if (!engaged && inTarget(e)) {
        engaged = true;
        setRect(null);
      }
    };
    const measure = () => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      if (!el || engaged) return setRect(null);
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return setRect(null);
      setRect((prev) =>
        prev && prev.x === r.left && prev.y === r.top && prev.w === r.width && prev.h === r.height
          ? prev
          : { x: r.left, y: r.top, w: r.width, h: r.height },
      );
    };
    measure();
    const t = setInterval(measure, 200);
    const events = ["pointerdown", "keydown"] as const; // not focus: fields may autofocus on load
    events.forEach((ev) => document.addEventListener(ev, onInteract, true));
    return () => {
      clearInterval(t);
      events.forEach((ev) => document.removeEventListener(ev, onInteract, true));
    };
  }, [target, dismissed]);
  return rect;
}

export function TutorialGuide() {
  const session = tutorialSession.use();
  const name = useSettings().userName; // re-render when the player's name changes
  const step = session.active ? STEPS[session.step] : undefined;
  // Pressing a helper button (e.g. "Show me" → Notepad) means the player is busy: hide the spotlight.
  const [dismissedStep, setDismissedStep] = useState<string | null>(null);
  const rect = useTargetRect(step?.target, dismissedStep === step?.id);
  const say = (t: string) => personalize(t, name);

  // First login: Scout pops up by himself (once ever, until the PC is reset).
  useEffect(() => {
    if (tutorialProgress.get().done || tutorialSession.get().active) return;
    const t = setTimeout(() => {
      if (!tutorialProgress.get().done) startTutorial();
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // "Do it yourself" steps finish when the player does the thing.
  useSystemEvent((e) => {
    const s = tutorialSession.get();
    const current = s.active ? STEPS[s.step] : undefined;
    if (current?.waitFor?.(e)) nextStep();
  });

  if (!step) return null;
  const last = session.step === STEPS.length - 1;
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
            <button className="link-btn scout-skip" onClick={skipTutorial}>
              Skip tutorial
            </button>
            <span className="scout-count">
              {session.step + 1}/{STEPS.length}
            </span>
            {session.step > 0 && !step.waitFor && (
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
