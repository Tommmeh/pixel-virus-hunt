import { beforeEach, describe, expect, it } from "vitest";
import { PEOPLE } from "../../system/people";
import { getNode, SCRIPTS } from "./scripts";
import { chatStore, choose, isTyping, startConversation, visible } from "./store";

beforeEach(() => chatStore.reset());

describe("messenger scripts", () => {
  it("every contact has exactly one script, and every script a real contact", () => {
    for (const p of PEOPLE)
      expect(
        SCRIPTS.filter((s) => s.contact === p.id),
        p.id,
      ).toHaveLength(1);
    for (const s of SCRIPTS) expect(PEOPLE.map((p) => p.id)).toContain(s.contact);
  });

  it("every choice leads to an existing node, and nodes have unique ids", () => {
    for (const s of SCRIPTS) {
      const ids = s.nodes.map((n) => n.id);
      expect(new Set(ids).size, s.contact).toBe(ids.length);
      expect(ids, s.contact).toContain(s.start);
      for (const n of s.nodes) {
        expect(n.choices.length, `${s.contact}/${n.id} has no choices`).toBeGreaterThan(0);
        for (const c of n.choices)
          if (c.next) expect(ids, `${s.contact}/${n.id}`).toContain(c.next);
      }
    }
  });

  it("every node is reachable from the start", () => {
    for (const s of SCRIPTS) {
      const seen = new Set<string>();
      const stack = [s.start];
      while (stack.length) {
        const id = stack.pop()!;
        if (seen.has(id)) continue;
        seen.add(id);
        getNode(s, id)?.choices.forEach((c) => c.next && stack.push(c.next));
      }
      expect([...seen].sort(), s.contact).toEqual(s.nodes.map((n) => n.id).sort());
    }
  });

  it("plays a conversation with typing delays", () => {
    startConversation("alex", 0);
    let t = chatStore.get().threads["alex"]!;
    expect(visible(t, 0)).toHaveLength(0);
    expect(isTyping(t, 0)).toBe(true);
    expect(visible(t, 10_000).length).toBeGreaterThan(0);
    choose("alex", 0, 10_000);
    t = chatStore.get().threads["alex"]!;
    expect(t.node).toBe("boss");
    expect(t.msgs.filter((m) => m.from === "me")).toHaveLength(1);
  });
});
