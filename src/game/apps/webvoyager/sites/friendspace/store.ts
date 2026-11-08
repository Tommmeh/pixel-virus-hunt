import { emit } from "../../../../system/events";
import { createStore } from "../../../../system/store";

export interface Post {
  id: string;
  author: string; // person id, or "me"
  text: string;
  time: string;
  likes: number;
  /** Optional link shown under the text (opens in WebVoyager). */
  link?: string;
}

export const SEED_POSTS: Post[] = [
  {
    id: "p2",
    author: "priya",
    text: "Art club mural is coming together. Photos soon!",
    time: "5 hours ago",
    likes: 7,
  },
  {
    id: "p3",
    author: "mum",
    text: "First tomatoes of the year 🍅 so proud",
    time: "Yesterday",
    likes: 3,
  },
  {
    id: "p4",
    author: "sam",
    text: "Won 54-48 tonight. Best game of the season 🏀",
    time: "Yesterday",
    likes: 9,
  },
  {
    id: "p5",
    author: "jordan",
    text: "Rovers U16 v Hillside on Saturday 10am. Come and watch!",
    time: "2 days ago",
    likes: 5,
  },
];

export interface SocialState {
  posts: Post[]; // posts written by the player
  liked: string[];
  friends: string[];
  requests: string[];
}

export const socialStore = createStore<SocialState>("vh-social", {
  posts: [],
  liked: [],
  friends: ["priya", "sam", "mum"],
  requests: ["jordan"],
});
export const useSocial = socialStore.use;

let seq = 0;

export function post(text: string) {
  const t = text.trim();
  if (!t) return;
  socialStore.set((s) => ({
    ...s,
    posts: [
      { id: `me-${Date.now()}-${++seq}`, author: "me", text: t, time: "Just now", likes: 0 },
      ...s.posts,
    ],
  }));
  emit({ type: "social.post", text: t });
}

/** Add a post written by someone else (e.g. by a storyline). Newest first; ignored if the id exists. */
export function addPost(p: Post) {
  socialStore.set((s) =>
    s.posts.some((x) => x.id === p.id) ? s : { ...s, posts: [p, ...s.posts] },
  );
}

export function toggleLike(id: string) {
  socialStore.set((s) => ({
    ...s,
    liked: s.liked.includes(id) ? s.liked.filter((x) => x !== id) : [...s.liked, id],
  }));
}

export function answerRequest(person: string, accept: boolean) {
  socialStore.set((s) => ({
    ...s,
    requests: s.requests.filter((r) => r !== person),
    friends: accept && !s.friends.includes(person) ? [...s.friends, person] : s.friends,
  }));
  emit({ type: "social.friend", person, accepted: accept });
}
