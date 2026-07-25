import { describe, expect, it } from "vitest";
import {
  isClaudeMaxTurnsResult,
  detectClaudeLoginRequired,
  buildClaudeAuthRequiredMessage,
} from "@paperclipai/adapter-claude-local/server";

describe("claude_local max-turn detection", () => {
  it("detects max-turn exhaustion by subtype", () => {
    expect(
      isClaudeMaxTurnsResult({
        subtype: "error_max_turns",
        result: "Reached max turns",
      }),
    ).toBe(true);
  });

  it("detects max-turn exhaustion by stop_reason", () => {
    expect(
      isClaudeMaxTurnsResult({
        stop_reason: "max_turns",
      }),
    ).toBe(true);
  });

  it("returns false for non-max-turn results", () => {
    expect(
      isClaudeMaxTurnsResult({
        subtype: "success",
        stop_reason: "end_turn",
      }),
    ).toBe(false);
  });
});

describe("claude_local auth-required surfacing", () => {
  it("detects the raw CLI not-logged-in message as requiring login", () => {
    const meta = detectClaudeLoginRequired({
      parsed: { subtype: "success", result: "Not logged in · Please run /login" },
      stdout: "",
      stderr: "",
    });
    expect(meta.requiresLogin).toBe(true);
  });

  it("replaces the raw CLI message with actionable, provider-key guidance", () => {
    const msg = buildClaudeAuthRequiredMessage(null);
    // The user never runs the CLI, so the fix must not leak "/login" or "claude login".
    expect(msg).not.toMatch(/\/login/i);
    expect(msg).not.toMatch(/not logged in/i);
    expect(msg).toMatch(/connect a provider key/i);
    expect(msg).toMatch(/resume/i);
    // Brand voice: no em or en dashes in user-facing copy.
    expect(msg).not.toMatch(/[–—]/);
  });

  it("appends a sign-in URL when the CLI provides one", () => {
    const msg = buildClaudeAuthRequiredMessage("https://claude.ai/login?code=abc");
    expect(msg).toContain("https://claude.ai/login?code=abc");
    expect(msg).toMatch(/sign in/i);
  });
});
