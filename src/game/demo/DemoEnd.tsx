// The guided demo's ending (same black full-screen style as shell/EndGame.tsx), shown once PhotoWorm is removed.
import { VIRUS_TOTAL } from "../scams/questlines";
import { Scout } from "../tutorial/Scout";
import { exitDemo, startDemo } from "./store";

const WHAT_HAPPENED = [
  "A hacked friend's account posted a link to a fake photo viewer.",
  "The site wanted you to install a program to see some photos.",
  "The pop-ups got worse: free prizes, then 'your PC is slow', then fake virus alerts.",
  "It was a worm: it copied itself every time you closed a window.",
  "Only a real antivirus scan got rid of it.",
];

const TIPS = [
  "Check the address: https and a padlock, and the real site name right before the first '/'.",
  "Never install a 'viewer' or 'player' just to see photos or videos.",
  "Don't click inside pop-ups. Close the browser and run your antivirus.",
];

export function DemoEnd() {
  return (
    <div className="demo-end">
      <Scout size={96} cheer />
      <p className="demo-end-title">WORM REMOVED</p>
      <p className="demo-end-sub">YOU SURVIVED PHOTOWORM</p>
      <div className="demo-end-cols">
        <section>
          <p className="demo-end-head">WHAT JUST HAPPENED</p>
          <ol>
            {WHAT_HAPPENED.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </section>
        <section>
          <p className="demo-end-head">NEXT TIME</p>
          <ul>
            {TIPS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      </div>
      <p className="demo-end-note">
        Viruses caught: 1 / {VIRUS_TOTAL}. The other {VIRUS_TOTAL - 1} are hiding in the full game:
        a bank scam, a dodgy USB stick, a hot stock tip, AI chat scammers, and no Scout telling you
        where to click.
      </p>
      <div className="demo-end-actions">
        <button className="nes-btn is-primary" onClick={exitDemo}>
          Try the full experience
        </button>
        <button className="nes-btn" onClick={startDemo}>
          Replay demo
        </button>
      </div>
    </div>
  );
}
