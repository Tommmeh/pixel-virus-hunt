import { A } from "../BrowserContext";
import type { PageUrl } from "../url";

const BASE = "http://www.dailybyte.com";

const ARTICLES = [
  {
    id: "mp3",
    title: "New MP3 players can hold 1,000 songs",
    blurb: "Pocket-sized players with 5 GB hard drives are flying off the shelves.",
    body: "This autumn's must-have gadget fits in your pocket and holds your entire CD collection. Prices start at £199, and battery life is up to 8 hours. Reviewers say the click-wheel controls take a minute to learn but are worth it.",
  },
  {
    id: "broadband",
    title: "Broadband reaches more homes than ever",
    blurb: "Say goodbye to the dial-up screech: 'always-on' internet is spreading fast.",
    body: "More than a third of homes now have a broadband connection, offering speeds of up to 2 Mbps. Families say the biggest change is not tying up the phone line while someone is online.",
  },
  {
    id: "tips",
    title: "5 tips to keep your PC running smoothly",
    blurb: "Simple habits that keep your computer fast and healthy.",
    body: "1. Install updates from the official update tool.\n2. Don't fill your desktop with hundreds of files.\n3. Restart your PC every so often.\n4. Only install programs you actually need, from sources you trust.\n5. Back up your photos to CD or a USB stick.",
  },
  {
    id: "robots",
    title: "Local school wins regional robotics contest",
    blurb: "Students built a robot that can sort recycling in under a minute.",
    body: "A team of Year 10 students took first place with 'BinBot', which uses light sensors to sort cans from bottles. The team now heads to the national finals in the spring.",
  },
  {
    id: "weather",
    title: "Sunny weekend ahead",
    blurb: "Highs of 22°C expected on Saturday — perfect for the park.",
    body: "Forecasters expect a dry, bright weekend with light winds. Showers may return on Monday evening.",
  },
];

export function DailyByte({ url }: { url: PageUrl }) {
  const id = url.path.startsWith("/article/") ? url.path.slice("/article/".length) : null;
  const article = ARTICLES.find((a) => a.id === id);
  return (
    <div className="dailybyte">
      <div className="db-header">
        <A href={`${BASE}/`} className="db-logo">
          The Daily <b>Byte</b>
        </A>
        <span>Technology news for everyone · Est. 1999</span>
      </div>
      <div className="db-layout">
        <main>
          {article ? (
            <article>
              <h2>{article.title}</h2>
              <p className="db-body">{article.body}</p>
              <A href={`${BASE}/`}>← Back to front page</A>
            </article>
          ) : (
            ARTICLES.map((a) => (
              <div key={a.id} className="db-item">
                <A href={`${BASE}/article/${a.id}`} className="db-title">
                  {a.title}
                </A>
                <p>{a.blurb}</p>
              </div>
            ))
          )}
        </main>
        <aside className="db-ad">
          <small>ADVERTISEMENT</small>
          <b>Copperleaf Bank</b>
          <p>Rainy Day Savings — 3.5% AER</p>
          <A href="https://www.copperleafbank.com/">Find out more</A>
        </aside>
      </div>
    </div>
  );
}
