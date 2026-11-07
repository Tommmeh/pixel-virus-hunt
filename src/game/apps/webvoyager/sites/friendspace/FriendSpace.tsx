import { useState } from "react";
import { getPerson, PEOPLE } from "../../../../system/people";
import { PROFILE } from "../../../../system/profile";
import { useSettings } from "../../../../system/settings";
import { A } from "../../BrowserContext";
import type { PageUrl } from "../../url";
import { answerRequest, post, SEED_POSTS, toggleLike, useSocial, type Post } from "./store";

const BASE = "http://www.friendspace.com";

function PostCard({ p, liked }: { p: Post; liked: boolean }) {
  const s = useSettings();
  const person = p.author === "me" ? null : getPerson(p.author);
  return (
    <div className="fs-post">
      <span className="fs-avatar">{person ? person.avatar : s.avatar}</span>
      <div className="fs-post-body">
        <b>{person ? person.name : `${s.userName} Taylor`}</b>
        <p>{p.text}</p>
        <span className="fs-meta">
          {p.time} ·{" "}
          <button className="link-btn" onClick={() => toggleLike(p.id)}>
            {liked ? "Unlike" : "Like"}
          </button>{" "}
          · {p.likes + (liked ? 1 : 0)} likes
        </span>
      </div>
    </div>
  );
}

function Composer() {
  const [text, setText] = useState("");
  return (
    <form
      className="fs-composer"
      onSubmit={(e) => {
        e.preventDefault();
        post(text);
        setText("");
      }}
    >
      <textarea
        className="xp-input"
        placeholder="What are you up to?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={280}
      />
      <button className="xp-btn fs-btn" type="submit" disabled={!text.trim()}>
        Post
      </button>
    </form>
  );
}

export function FriendSpace({ url }: { url: PageUrl }) {
  const social = useSocial();
  const s = useSettings();
  const visibleSeed = SEED_POSTS.filter((p) => social.friends.includes(p.author));
  const feed = [...social.posts, ...visibleSeed];

  let main;
  if (url.path === "/profile") {
    main = (
      <>
        <div className="fs-profile-head">
          <span className="fs-avatar is-big">{s.avatar}</span>
          <div>
            <h2>{s.userName} Taylor</h2>
            <p>
              @{PROFILE.friendspaceHandle} · {social.friends.length} friends
            </p>
          </div>
        </div>
        <h3>My posts</h3>
        {social.posts.length === 0 ? (
          <p className="fs-empty">You haven't posted anything yet.</p>
        ) : (
          social.posts.map((p) => <PostCard key={p.id} p={p} liked={social.liked.includes(p.id)} />)
        )}
      </>
    );
  } else if (url.path === "/friends") {
    main = (
      <>
        <h3>My friends ({social.friends.length})</h3>
        <ul className="fs-friends">
          {social.friends.map((id) => {
            const p = getPerson(id)!;
            return (
              <li key={id}>
                <span className="fs-avatar">{p.avatar}</span>
                <span>
                  <b>{p.name}</b>
                  <small>{p.bio}</small>
                </span>
              </li>
            );
          })}
        </ul>
      </>
    );
  } else {
    main = (
      <>
        <Composer />
        {feed.map((p) => (
          <PostCard key={p.id} p={p} liked={social.liked.includes(p.id)} />
        ))}
      </>
    );
  }

  return (
    <div className="friendspace">
      <div className="fs-header">
        <span className="fs-logo">
          friend<b>space</b>
        </span>
        <nav>
          <A href={`${BASE}/`}>Home</A>
          <A href={`${BASE}/profile`}>Profile</A>
          <A href={`${BASE}/friends`}>Friends</A>
        </nav>
      </div>
      <div className="fs-layout">
        <aside className="fs-side">
          <span className="fs-avatar is-big">{s.avatar}</span>
          <b>{s.userName} Taylor</b>
          <small>@{PROFILE.friendspaceHandle}</small>
        </aside>
        <main className="fs-main">{main}</main>
        <aside className="fs-side">
          <b>Friend requests</b>
          {social.requests.length === 0 ? (
            <small>No new requests.</small>
          ) : (
            social.requests.map((id) => {
              const p = getPerson(id)!;
              return (
                <div key={id} className="fs-request">
                  <span className="fs-avatar">{p.avatar}</span>
                  <span>{p.name}</span>
                  <span className="flex gap-1">
                    <button className="xp-btn is-small" onClick={() => answerRequest(id, true)}>
                      Accept
                    </button>
                    <button className="xp-btn is-small" onClick={() => answerRequest(id, false)}>
                      Ignore
                    </button>
                  </span>
                </div>
              );
            })
          )}
          <b className="mt-3">People you may know</b>
          {PEOPLE.filter((p) => !social.friends.includes(p.id) && !social.requests.includes(p.id))
            .slice(0, 3)
            .map((p) => (
              <small key={p.id}>
                {p.avatar} {p.name}
              </small>
            ))}
        </aside>
      </div>
    </div>
  );
}
