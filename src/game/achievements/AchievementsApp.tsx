// The Achievements window: every badge, earned ones in colour. Locked ones still show what to do, as a hint
// for exploring the PC. (The viruses themselves live in the Quests app and the counter at the top.)
import { PixelIcon } from "../components/PixelIcon";
import { ACHIEVEMENTS, useAchievements } from "./achievements";

export function AchievementsApp() {
  const { unlocked } = useAchievements();
  const done = ACHIEVEMENTS.filter((a) => a.id in unlocked).length;
  return (
    <div className="p-2 ach-scroll">
      <div className="trophy-head">
        <p>
          <b>Achievements</b> {done} / {ACHIEVEMENTS.length}
        </p>
        <progress
          className="nes-progress is-success"
          value={done}
          max={ACHIEVEMENTS.length}
          aria-label="Achievements earned"
        />
      </div>
      <ul className="badge-list">
        {ACHIEVEMENTS.map((a) => {
          const got = a.id in unlocked;
          // Hidden badges keep the joke until they're earned: no name, no hint.
          const secret = !!a.hidden && !got;
          return (
            <li key={a.id} className={`badge ${got ? "is-got" : "is-locked"}`}>
              <span className="badge-icon">
                <PixelIcon name={secret ? "info" : a.icon} size={32} />
              </span>
              <span className="badge-text">
                <b>{secret ? "???" : a.name}</b>
                <span>{secret ? "Hidden achievement" : a.description}</span>
              </span>
              <span
                className="badge-mark"
                aria-label={got ? "Earned" : secret ? "Hidden" : "Not yet"}
              >
                {got ? "✓" : secret ? "?" : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
