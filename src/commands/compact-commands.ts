// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2026 avtc <tarasenkov@gmail.com>

/**
 * Compact commands — `/fy:continue`.
 *
 * Resumes the workflow after a context compaction that did not auto-inject (the user ran
 * `/compact`, or the agent's turn ended with no staged phase-transition). The compact-handler
 * stages the assembled skill+framing message; this command consumes it and dispatches it as a
 * follow-up. An optional note is appended so the user can steer while continuing.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { consumeContinueFollowUp } from "../compaction/continue-followup.js";

export function registerCompactCommands(pi: ExtensionAPI): void {
  pi.registerCommand("fy:continue", {
    description:
      "Continue the workflow after a context compaction (optionally append a note, e.g. /fy:continue also check the tests)",
    async handler(args, ctx) {
      const message = consumeContinueFollowUp();
      // Nothing staged — tell the user when /fy:continue is useful (not a silent no-op).
      if (message === null) {
        if (ctx.hasUI) {
          ctx.ui.notify(
            "Nothing to continue — run /fy:continue to resume after /compact or an automatic compaction.",
            "info",
          );
        }
        return;
      }

      const note = args.trim();
      const full = note ? `${message}\n\nUser message: ${note}` : message;
      pi.sendUserMessage(full, { deliverAs: "followUp" });
    },
  });
}
