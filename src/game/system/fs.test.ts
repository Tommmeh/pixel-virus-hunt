import { beforeEach, describe, expect, it } from "vitest";
import {
  DESKTOP_DIR,
  MY_DOCUMENTS,
  fsStore,
  getNode,
  isWritableDir,
  joinPath,
  listDir,
  normalizePath,
  parentPath,
  readFile,
  writeFile,
} from "./fs";

beforeEach(() => fsStore.reset());

describe("virtual file system", () => {
  it("has a C: and an E: drive", () => {
    expect(getNode("C:\\")?.type).toBe("folder");
    expect(getNode("E:\\")?.type).toBe("folder");
    expect(listDir("E:\\").map((n) => n.name)).toContain("readme.txt");
  });

  it("normalizes paths and is case-insensitive", () => {
    expect(normalizePath("c:")).toBe("C:\\");
    expect(normalizePath("c:\\windows\\")).toBe("C:\\windows");
    expect(getNode("c:\\documents and settings\\user\\my documents\\NOTES.TXT")?.type).toBe("file");
    expect(parentPath(MY_DOCUMENTS)).toBe("C:\\Documents and Settings\\User");
    expect(parentPath("C:\\")).toBe("");
  });

  it("lists folders before files", () => {
    const names = listDir(MY_DOCUMENTS).map((n) => n.name);
    expect(names.indexOf("My Music")).toBeLessThan(names.indexOf("notes.txt"));
  });

  it("passwords.txt on the desktop holds the passwords (quest hook)", () => {
    expect(readFile(joinPath(DESKTOP_DIR, "passwords.txt"))).toContain("sunflower42");
    expect(listDir(DESKTOP_DIR).map((n) => n.name)).not.toContain("shopping_list.txt");
  });

  it("saves new files into My Documents and shows them in listings", () => {
    expect(writeFile(joinPath(MY_DOCUMENTS, "diary.txt"), "dear diary")).toBe(true);
    expect(readFile(joinPath(MY_DOCUMENTS, "diary.txt"))).toBe("dear diary");
    expect(listDir(MY_DOCUMENTS).map((n) => n.name)).toContain("diary.txt");
  });

  it("can overwrite an existing text file", () => {
    writeFile(joinPath(DESKTOP_DIR, "passwords.txt"), "changed them all");
    expect(readFile(joinPath(DESKTOP_DIR, "passwords.txt"))).toBe("changed them all");
    expect(listDir(DESKTOP_DIR).filter((n) => n.name === "passwords.txt")).toHaveLength(1);
  });

  it("refuses to write into system folders", () => {
    expect(isWritableDir("C:\\WINDOWS\\System32")).toBe(false);
    expect(writeFile("C:\\WINDOWS\\System32\\evil.txt", "x")).toBe(false);
    expect(isWritableDir(MY_DOCUMENTS)).toBe(true);
    expect(isWritableDir("E:\\School")).toBe(true);
  });
});
