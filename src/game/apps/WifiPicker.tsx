// Opened from the taskbar tray. Lists `tray` lures as Wi-Fi networks next to safe ones.
import { useState } from "react";
import { LureCard } from "../components/LureCard";
import { PixelIcon } from "../components/PixelIcon";
import { scamsAt } from "../scams";

const SAFE_NETWORKS = [
  { name: "My_Phone_Hotspot", detail: "WPA2 · your phone" },
  { name: "CafeAroma_Staff", detail: "WPA2 · password required" },
];

export function WifiPicker() {
  const lures = scamsAt("tray");
  const [sel, setSel] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);
  const lure = lures.find((s) => s.id === sel);

  if (lure) {
    return (
      <div className="text-[10px]">
        <LureCard
          scam={lure}
          safeLabel="Back"
          onBait={() => setConnected(lure.lure.title)}
          onDone={() => setSel(null)}
        />
      </div>
    );
  }

  const networks = [
    ...lures.map((s) => ({ id: s.id, name: s.lure.title, detail: "Open network" })),
    ...SAFE_NETWORKS.map((n) => ({ id: `safe:${n.name}`, ...n })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="text-[10px]">
      <p className="mb-2">Choose a wireless network:</p>
      <ul className="flex flex-col gap-2">
        {networks.map((n) => (
          <li key={n.id}>
            <button
              className={`wifi-row ${connected === n.name ? "is-active" : ""}`}
              onClick={() => (n.id.startsWith("safe:") ? setConnected(n.name) : setSel(n.id))}
            >
              <PixelIcon name="wifi" size={20} />
              <span className="flex flex-col gap-1 text-left">
                <span>{n.name}</span>
                <span className="opacity-70">{connected === n.name ? "Connected" : n.detail}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
