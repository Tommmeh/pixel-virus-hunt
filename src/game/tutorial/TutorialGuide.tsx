// Scout's tutorial overlay (mounted in shell/Desktop.tsx). Speech balloon + spotlight on the current target.
// The spotlight never blocks clicks, so the player can always use the highlighted thing.
// Scout picks his own corner (placement.ts) so he never sits on what he's pointing at, pop-ups or the
// window you're using, and hops to a new corner when the context changes.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSystemEvent } from "../system/events";
import { personalize } from "../system/profile";
import { useSettings } from "../system/settings";
import { activeKey, windowStore } from "../system/windows";
import { cornerRect, pickCorner, WEIGHT, type Corner, type Obstacle } from "./placement";
import { Scout } from "./Scout";
import {
  finishTutorial,
  nextStep,
  prevStep,
  skipTutorial,
  stepBack,
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

const TASKBAR = 40;
const POPUP_APPS = new Set(["worm-popup", "scampopup", "msgbox"]);

/** Everything on screen Scout would rather not cover, weighted by how much it matters. */
function obstacles(vw: number, vh: number): Obstacle[] {
  const state = windowStore.get();
  const active = activeKey(state);
  const list: Obstacle[] = state.wins
    .filter((w) => !w.min)
    .map((w) => ({
      rect: w.max ? { x: 0, y: 0, w: vw, h: vh - TASKBAR } : { x: w.x, y: w.y, w: w.w, h: w.h },
      weight: POPUP_APPS.has(w.app)
        ? WEIGHT.popup
        : w.key === active
          ? WEIGHT.active
          : WEIGHT.window,
    }));
  const balloons = document.querySelector(".balloons")?.getBoundingClientRect();
  if (balloons && balloons.height > 0)
    list.push({
      rect: { x: balloons.left, y: balloons.top, w: balloons.width, h: balloons.height },
      weight: WEIGHT.balloon,
    });
  return list;
}

/**
 * Which corner Scout stands in. Re-picked from scratch on every new step (so he moves next to what he's
 * talking about) and re-checked every few hundred ms as windows move (staying put unless clearly better).
 */
function useScoutCorner(
  boxRef: React.RefObject<HTMLDivElement | null>,
  stepKey: string | undefined,
  target: Rect | null,
  pinned: Corner | undefined,
  wantsTarget: boolean,
): { corner: Corner; pos: { left: number; top: number; transition?: string } } {
  const [state, setState] = useState<{
    corner: Corner;
    left: number;
    top: number;
    animate: boolean;
  }>({ corner: "br", left: -9999, top: -9999, animate: false });
  const targetRef = useRef(target);
  targetRef.current = target;

  useLayoutEffect(() => {
    if (!stepKey) return;
    // The first pick for a step ignores where he was standing. If the step points at something, wait
    // (a few ticks at most) for the spotlight to measure it, so he lands next to the right thing.
    let fresh = true;
    let waits = 0;
    const place = () => {
      const el = boxRef.current;
      if (!el) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const box = { w: el.offsetWidth, h: el.offsetHeight };
      const wasFresh = fresh;
      // (The very first call runs before the spotlight has re-measured, so it always waits one tick.)
      if (wantsTarget && fresh && waits < 5 && (waits++ === 0 || !targetRef.current)) {
        if (el.style.left !== "-9999px") return;
      } else fresh = false;
      setState((prev) => {
        const corner =
          pinned ??
          pickCorner({
            vw,
            vh,
            box,
            target: targetRef.current,
            obstacles: obstacles(vw, vh),
            current: wasFresh ? null : prev.corner,
          });
        const r = cornerRect(corner, vw, vh, box);
        return prev.corner === corner && prev.left === r.x && prev.top === r.y
          ? prev
          : { corner, left: r.x, top: r.y, animate: prev.left !== -9999 }; // no slide-in on first show
      });
    };
    place();
    const soon = setTimeout(place, 80);
    const t = setInterval(place, 350);
    window.addEventListener("resize", place);
    return () => {
      clearTimeout(soon);
      clearInterval(t);
      window.removeEventListener("resize", place);
    };
  }, [boxRef, stepKey, pinned, wantsTarget]);

  return {
    corner: state.corner,
    pos: { left: state.left, top: state.top, ...(state.animate ? {} : { transition: "none" }) },
  };
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
  // Hands-on steps with an `after` message: the player did the thing, now Scout says his piece.
  const [afterStep, setAfterStep] = useState<string | null>(null);
  const showAfter = !!step?.after && (afterStep === step.id || !!step.doneIf?.());
  const rect = useTargetRect(step?.target, dismissedStep === step?.id || showAfter);
  const say = (t: string) => personalize(t, name);
  const boxRef = useRef<HTMLDivElement>(null);
  const stepKey = step ? `${session.script}:${step.id}:${showAfter}` : undefined;
  const { corner, pos } = useScoutCorner(
    boxRef,
    stepKey,
    rect,
    step?.placement,
    !!step?.target && dismissedStep !== step.id && !showAfter,
  );

  // If what the step relies on goes away (browser closed, browsed off the page), step back with the player.
  // It has to stay gone for two checks in a row, so a page that's still loading doesn't count.
  useEffect(() => {
    if (!step?.undoIf || showAfter) return;
    let misses = 0;
    const t = setInterval(() => {
      misses = step.undoIf!() ? misses + 1 : 0;
      if (misses >= 2) stepBack();
    }, 400);
    return () => clearInterval(t);
  }, [step, showAfter]);

  // A replay starts clean.
  useEffect(() => {
    if (session.active) return;
    setAfterStep(null);
    setDismissedStep(null);
  }, [session.active]);

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
    if (!current?.waitFor?.(e)) return;
    if (current.after) setAfterStep(current.id);
    else nextStep();
  });

  if (!step) return null;
  const last = session.step === steps.length - 1;
  const pad = 6;
  const waiting = !!step.waitFor && !showAfter;
  const title = showAfter ? step.after!.title : step.title;
  const text = showAfter ? step.after!.text : step.text;
  const left = corner === "tl" || corner === "bl";

  return (
    <>
      {rect && (
        <div
          // Hands-on steps get a plain outline (no dimming) so other windows like Notepad stay readable.
          className={`tour-spot ${waiting ? "is-soft" : ""}`}
          style={{
            left: rect.x - pad,
            top: rect.y - pad,
            width: rect.w + pad * 2,
            height: rect.h + pad * 2,
          }}
          aria-hidden
        />
      )}
      <div
        ref={boxRef}
        className={`scout-box ${left ? "is-left" : ""}`}
        style={pos}
        role="dialog"
        aria-label="Tutorial"
      >
        <div className={`nes-balloon ${left ? "from-left" : "from-right"} scout-balloon`}>
          <p className="scout-title">{say(title)}</p>
          {text.map((t) => (
            <p key={t}>{say(t)}</p>
          ))}
          {waiting && step.hint && <p className="scout-hint">▶ {step.hint}</p>}
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
            {step.action && waiting && (
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
            {!waiting && (
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
          <Scout cheer={last && !waiting} />
        </div>
      </div>
    </>
  );
}
