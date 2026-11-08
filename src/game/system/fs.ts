// Virtual file system: drives C: and E: as data, plus a persisted overlay of files the user saves.
import { emit } from "./events";
import { personalize } from "./profile";
import { createStore } from "./store";

export type FileKind = "text" | "image" | "audio" | "doc" | "program" | "system";

export interface FsFile {
  type: "file";
  name: string;
  kind: FileKind;
  size: string;
  content?: string;
  /** For programs: the app id to launch. */
  app?: string;
}

export interface FsFolder {
  type: "folder";
  name: string;
  children: FsNode[];
  readonly?: boolean;
}

export type FsNode = FsFile | FsFolder;

export interface Drive {
  letter: string; // "C:"
  label: string;
  kind: "hdd" | "usb";
  total: string;
  free: string;
  used: number; // 0..1
  root: FsFolder;
}

const folder = (name: string, children: FsNode[], readonly?: boolean): FsFolder => ({
  type: "folder",
  name,
  children,
  ...(readonly ? { readonly } : {}),
});
const file = (name: string, kind: FileKind, size: string, extra: Partial<FsFile> = {}): FsFile => ({
  type: "file",
  name,
  kind,
  size,
  ...extra,
});

const NOTES = `Things to remember!!
- Dentist Tuesday 4pm
- Return library books
- Buy Mum a birthday card (birthday is the 14th)

Passwords (don't forget!!)
HotPost email: jamie.taylor@hotpost.com / sunflower42
Copperleaf Bank: jamie.taylor / sunflower42
FriendSpace: same as email
`;

const SHOPPING = `Shopping list
- milk
- bread
- batteries (AA) for the camera
- blank CDs
`;

const WIN_INI = `; for 16-bit app support
[fonts]
[extensions]
[mci extensions]
[files]
[Mail]
MAPI=1
`;

const README_USB = `This USB stick belongs to {name}.
If found, please hand it in at the school office. Thanks!
`;

const REVISION = `History revision - Industrial Revolution
1. Spinning jenny - 1764
2. Steam engine improvements - James Watt, 1769
3. First public railway - 1825
Remember: causes, consequences, key people!
`;

export const DRIVES: Drive[] = [
  {
    letter: "C:",
    label: "Local Disk",
    kind: "hdd",
    total: "40.0 GB",
    free: "28.3 GB",
    used: 0.29,
    root: folder("C:", [
      folder("Documents and Settings", [
        folder("User", [
          folder("Desktop", [file("shopping_list.txt", "text", "1 KB", { content: SHOPPING })]),
          folder("My Documents", [
            file("notes.txt", "text", "1 KB", { content: NOTES }),
            file("history_essay.doc", "doc", "48 KB"),
            file("budget_2004.xls", "doc", "21 KB"),
            folder("My Pictures", [
              file("beach_day.jpg", "image", "812 KB"),
              file("birthday_party.jpg", "image", "1,024 KB"),
              file("cat_in_box.jpg", "image", "640 KB"),
            ]),
            folder("My Music", [
              file("summer_mix_01.mp3", "audio", "4,210 KB"),
              file("summer_mix_02.mp3", "audio", "3,980 KB"),
            ]),
          ]),
        ]),
      ]),
      folder("Program Files", [
        folder("WebVoyager", [
          file("webvoyager.exe", "program", "1,820 KB", { app: "webvoyager" }),
        ]),
        folder("PingMe Messenger", [
          file("pingme.exe", "program", "2,304 KB", { app: "messenger" }),
        ]),
        folder("Mines", [file("mines.exe", "program", "120 KB", { app: "mines" })]),
      ]),
      folder(
        "WINDOWS",
        [
          file("notepad.exe", "program", "68 KB", { app: "notepad" }),
          file("win.ini", "text", "1 KB", { content: WIN_INI }),
          folder(
            "System32",
            [
              file("kernel32.dll", "system", "960 KB"),
              file("hal.dll", "system", "128 KB"),
              file("svchost.exe", "system", "14 KB"),
              file("taskmgr.exe", "program", "132 KB", { app: "taskmgr" }),
              file("drivers.cab", "system", "2,400 KB"),
            ],
            true,
          ),
        ],
        true,
      ),
    ]),
  },
  {
    letter: "E:",
    label: "KINGSTON",
    kind: "usb",
    total: "1.0 GB",
    free: "0.7 GB",
    used: 0.3,
    root: folder("E:", [
      file("readme.txt", "text", "1 KB", { content: README_USB }),
      folder("School", [
        file("revision_notes.txt", "text", "1 KB", { content: REVISION }),
        file("history_project.doc", "doc", "96 KB"),
      ]),
      folder("Photos", [
        file("holiday_01.jpg", "image", "1,200 KB"),
        file("holiday_02.jpg", "image", "1,150 KB"),
      ]),
    ]),
  },
];

export const MY_COMPUTER = "";
export const USER_HOME = "C:\\Documents and Settings\\User";
export const MY_DOCUMENTS = `${USER_HOME}\\My Documents`;
export const DESKTOP_DIR = `${USER_HOME}\\Desktop`;

// --- Path helpers (Windows-style, case-insensitive) ---

export function splitPath(path: string): string[] {
  return path.split("\\").filter(Boolean);
}

export function normalizePath(path: string): string {
  const parts = splitPath(path.trim());
  if (parts.length === 0) return MY_COMPUTER;
  const drive = parts[0]!.toUpperCase();
  return parts.length === 1 ? `${drive}\\` : [drive, ...parts.slice(1)].join("\\");
}

export function joinPath(dir: string, name: string): string {
  const d = normalizePath(dir);
  return d.endsWith("\\") ? `${d}${name}` : `${d}\\${name}`;
}

export function parentPath(path: string): string {
  const parts = splitPath(normalizePath(path));
  if (parts.length <= 1) return MY_COMPUTER;
  return normalizePath(parts.slice(0, -1).join("\\"));
}

export function baseName(path: string): string {
  const parts = splitPath(path);
  return parts[parts.length - 1] ?? "";
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export function getDrive(path: string): Drive | undefined {
  const first = splitPath(path)[0];
  return first ? DRIVES.find((d) => same(d.letter, first)) : undefined;
}

/** Find a node in the base tree (ignores user files). */
export function getBaseNode(path: string): FsNode | null {
  const drive = getDrive(path);
  if (!drive) return null;
  let node: FsNode = drive.root;
  for (const part of splitPath(path).slice(1)) {
    if (node.type !== "folder") return null;
    const next: FsNode | undefined = node.children.find((c) => same(c.name, part));
    if (!next) return null;
    node = next;
  }
  return node;
}

// --- User-saved files (persisted overlay) ---

export interface UserFile {
  content: string;
  modified: number;
}

export const fsStore = createStore<{ files: Record<string, UserFile> }>("vh-fs", { files: {} });
export const useFs = fsStore.use;

type Files = Record<string, UserFile>;

const userEntry = (files: Files, path: string) =>
  Object.entries(files).find(([p]) => same(p, normalizePath(path)));

export function getNode(path: string, files: Files = fsStore.get().files): FsNode | null {
  const base = getBaseNode(path);
  const user = userEntry(files, path);
  if (user) {
    const content = user[1].content;
    return file(baseName(user[0]), "text", sizeOf(content), { content });
  }
  return base;
}

export function isFolder(path: string): boolean {
  return path === MY_COMPUTER || getBaseNode(path)?.type === "folder";
}

/** Folder contents: base children + user files saved in that folder. Folders first, then A–Z. */
export function listDir(path: string, files: Files = fsStore.get().files): FsNode[] {
  const node = getBaseNode(path);
  if (!node || node.type !== "folder") return [];
  const out: FsNode[] = node.children.map((c) =>
    c.type === "file" ? (getNode(joinPath(path, c.name), files) ?? c) : c,
  );
  for (const [p] of Object.entries(files)) {
    if (same(parentPath(p), normalizePath(path)) && !out.some((c) => same(c.name, baseName(p)))) {
      out.push(getNode(p, files)!);
    }
  }
  return out.sort((a, b) =>
    a.type !== b.type ? (a.type === "folder" ? -1 : 1) : a.name.localeCompare(b.name),
  );
}

export function readFile(path: string, files: Files = fsStore.get().files): string | null {
  const n = getNode(path, files);
  return n && n.type === "file" && n.kind === "text" ? personalize(n.content ?? "") : null;
}

/** Can the user save files into this folder? (Not system folders, not into files.) */
export function isWritableDir(dir: string): boolean {
  const node = getBaseNode(dir);
  if (!node || node.type !== "folder") return false;
  const parts = splitPath(normalizePath(dir));
  let cur: FsNode | undefined = getDrive(dir)?.root;
  for (const part of parts.slice(1)) {
    if (!cur || cur.type !== "folder" || cur.readonly) return false;
    cur = cur.children.find((c) => same(c.name, part));
  }
  return !!cur && cur.type === "folder" && !cur.readonly;
}

export function writeFile(path: string, content: string): boolean {
  const p = normalizePath(path);
  const existing = getBaseNode(p);
  if (!isWritableDir(parentPath(p)) || existing?.type === "folder") return false;
  fsStore.set((s) => {
    const files = Object.fromEntries(Object.entries(s.files).filter(([k]) => !same(k, p)));
    return { files: { ...files, [p]: { content, modified: Date.now() } } };
  });
  emit({ type: "file.save", path: p });
  return true;
}

export function sizeOf(text: string): string {
  return `${Math.max(1, Math.ceil(text.length / 1024))} KB`;
}

export const ICON_FOR_KIND: Record<FileKind, string> = {
  text: "notepad",
  image: "image",
  audio: "music",
  doc: "doc",
  program: "exe",
  system: "file",
};
