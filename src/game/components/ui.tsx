// Small PaneOS UI helpers built on NES.css classes. Styling: src/styles.css (themed per .os[data-theme]).
import { useEffect, useState, type ReactNode, type SelectHTMLAttributes } from "react";

/** A row of NES buttons acting as tabs; the active one is `is-primary`. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="os-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          className={`nes-btn is-small ${value === t.id ? "is-primary" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** NES.css titled container. */
export function GroupBox({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`nes-container with-title os-group ${className}`}>
      <p className="title">{title}</p>
      {children}
    </section>
  );
}

/** NES.css select (needs a wrapper div for the pixel arrow). */
export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`nes-select is-small ${className}`}>
      <select {...props} />
    </div>
  );
}

/** NES.css checkbox / radio with a label. */
export function Check({
  checked,
  onChange,
  children,
  radio,
  name,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  radio?: boolean;
  name?: string;
}) {
  return (
    <label className="os-check">
      <input
        type={radio ? "radio" : "checkbox"}
        className={radio ? "nes-radio" : "nes-checkbox"}
        checked={checked}
        name={name}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

/** Re-render every `ms` milliseconds; returns Date.now(). */
export function useNow(ms = 1000, enabled = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms, enabled]);
  return now;
}

export function formatMoney(n: number) {
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
