// Track B owns this file. Minimal inbox from Phase 0 — expand freely (folders, unread, attachments...).
import { useState } from "react";
import { LureCard } from "../components/LureCard";
import { scamsAt } from "../scams";

const NORMAL_MAIL = [
  {
    id: "m-mom",
    from: "Mom <mum1957@hotpost.example>",
    subject: "Thanksgiving photos",
    body: "Hi honey, did you get the photos? Love, Mom",
  },
  {
    id: "m-it",
    from: "IT Helpdesk <helpdesk@yourcompany.example>",
    subject: "Reminder: report odd PC behaviour",
    body: "If your PC acts strange, tell us. We will never ask for your password by email.",
  },
];

export function EmailApp() {
  const [open, setOpen] = useState<string | null>(null);
  const lures = scamsAt("email");
  const rows = [
    ...lures.map((s) => ({ id: s.id, from: s.lure.from ?? "", subject: s.lure.title })),
    ...NORMAL_MAIL,
  ];
  const lure = lures.find((s) => s.id === open);
  const mail = NORMAL_MAIL.find((m) => m.id === open);

  return (
    <div className="text-[10px]">
      <div className="mb-2">HotPost Webmail — Inbox ({rows.length})</div>
      {lure ? (
        <div>
          <button className="nes-btn btn-xs mb-3" onClick={() => setOpen(null)}>
            &lt; Back
          </button>
          <LureCard scam={lure} onDone={() => setOpen(null)} />
        </div>
      ) : mail ? (
        <div className="leading-relaxed">
          <button className="nes-btn btn-xs mb-3" onClick={() => setOpen(null)}>
            &lt; Back
          </button>
          <p>From: {mail.from}</p>
          <p className="font-bold">{mail.subject}</p>
          <p className="mt-3">{mail.body}</p>
        </div>
      ) : (
        <table className="xp-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} onClick={() => setOpen(m.id)}>
                <td className="truncate" style={{ maxWidth: 180 }}>
                  {m.from.replace(/\s*<.*>/, "")}
                </td>
                <td>{m.subject}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
