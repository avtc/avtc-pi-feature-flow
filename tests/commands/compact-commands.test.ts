// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2026 avtc <tarasenkov@gmail.com>

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { registerCompactCommands } from "../../src/commands/compact-commands.js";
import { _resetContinueFollowUp, stageContinueFollowUp } from "../../src/compaction/continue-followup.js";

type CommandDef = { description: string; handler: (args: string, ctx: unknown) => Promise<void> };

interface FakePi {
  registerCommand: ReturnType<typeof vi.fn>;
  sendUserMessage: ReturnType<typeof vi.fn>;
}

function createFakePi(): { pi: FakePi; commands: Map<string, CommandDef> } {
  const commands = new Map<string, CommandDef>();
  const pi: FakePi = {
    registerCommand: vi.fn((name: string, def: CommandDef) => {
      commands.set(name, def);
    }),
    sendUserMessage: vi.fn(),
  };
  return { pi, commands };
}

/** Get the fy:continue command handler (throws if not registered — test setup invariant). */
function getContinueHandler(commands: Map<string, CommandDef>): CommandDef["handler"] {
  const cmd = commands.get("fy:continue");
  if (!cmd) throw new Error("fy:continue not registered");
  return cmd.handler;
}

const NO_OP_CTX = { hasUI: true, ui: { notify: vi.fn() } };

describe("/fy:continue command", () => {
  beforeEach(() => {
    _resetContinueFollowUp();
  });
  afterEach(() => {
    _resetContinueFollowUp();
  });

  test("registers as fy:continue with a description", () => {
    const { pi, commands } = createFakePi();
    registerCompactCommands(pi as unknown as ExtensionAPI);
    expect(commands.has("fy:continue")).toBe(true);
    expect(commands.get("fy:continue")?.description).toMatch(/context compaction/);
  });

  test("sends the staged follow-up via sendUserMessage (deliverAs: followUp)", async () => {
    const { pi, commands } = createFakePi();
    registerCompactCommands(pi as unknown as ExtensionAPI);
    stageContinueFollowUp('<skill name="fy-implement"/> do the work');

    await getContinueHandler(commands)("", NO_OP_CTX);

    expect(pi.sendUserMessage).toHaveBeenCalledTimes(1);
    const [msg, opts] = pi.sendUserMessage.mock.calls[0];
    expect(msg).toBe('<skill name="fy-implement"/> do the work');
    expect(opts).toEqual({ deliverAs: "followUp" });
  });

  test("appends the user note as 'User message:' when a note is given", async () => {
    const { pi, commands } = createFakePi();
    registerCompactCommands(pi as unknown as ExtensionAPI);
    stageContinueFollowUp('<skill name="fy-implement"/> do the work');

    await getContinueHandler(commands)("  also check the tests  ", NO_OP_CTX);

    expect(pi.sendUserMessage).toHaveBeenCalledTimes(1);
    const [msg] = pi.sendUserMessage.mock.calls[0];
    expect(msg).toBe('<skill name="fy-implement"/> do the work\n\nUser message: also check the tests');
  });

  test("notifies the user when nothing is staged (no silent no-op)", async () => {
    const { pi, commands } = createFakePi();
    registerCompactCommands(pi as unknown as ExtensionAPI);

    const notify = vi.fn();
    const ctxWithUi = { hasUI: true, ui: { notify } };
    await getContinueHandler(commands)("", ctxWithUi);

    expect(pi.sendUserMessage).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify.mock.calls[0][0]).toMatch(/Nothing to continue/);
    expect(notify.mock.calls[0][0]).toMatch(/\/compact or an automatic compaction/);
    expect(notify.mock.calls[0][1]).toBe("info");
  });

  test("trims an empty/whitespace note (does not append an empty User message line)", async () => {
    const { pi, commands } = createFakePi();
    registerCompactCommands(pi as unknown as ExtensionAPI);
    stageContinueFollowUp("base follow-up");

    await getContinueHandler(commands)("   ", NO_OP_CTX);

    expect(pi.sendUserMessage).toHaveBeenCalledTimes(1);
    const [msg] = pi.sendUserMessage.mock.calls[0];
    expect(msg).toBe("base follow-up");
  });
});
