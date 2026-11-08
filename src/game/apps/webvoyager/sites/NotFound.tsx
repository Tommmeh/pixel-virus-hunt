import { A } from "../BrowserContext";
import { HOME_URL, type PageUrl } from "../url";

export function NotFound({ url }: { url: PageUrl | null }) {
  return (
    <div className="wv-notfound">
      <h2>The page cannot be displayed</h2>
      <p>
        The page you are looking for is currently unavailable. The Web site might be experiencing
        technical difficulties, or you may need to adjust your browser settings.
      </p>
      <hr />
      <p>Please try the following:</p>
      <ul>
        <li>
          Make sure the Web site address {url ? <b>{url.host}</b> : null} is spelled correctly.
        </li>
        <li>
          Go to the <A href={HOME_URL}>Searchly</A> home page and search for the site.
        </li>
        <li>Click the Back button to try another link.</li>
      </ul>
      <p className="wv-notfound-code">Cannot find server or DNS Error — WebVoyager</p>
    </div>
  );
}
