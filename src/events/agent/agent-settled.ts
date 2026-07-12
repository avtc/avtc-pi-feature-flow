// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2026 avtc <tarasenkov@gmail.com>

/**
 * agent_settled event router — delegate to the agent-lifecycle domain method.
 *
 * Fires once per user prompt when pi has no pending retry/compaction/followUp
 * continuation (pi will not continue running automatically). Used to deliver the
 * staged phase-transition followUp (deferred) so it does not race a concurrently
 * typed user message.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { IAgentLifecycle } from "../../shared/workflow-types.js";

export function registerAgentSettled(pi: ExtensionAPI, lifecycle: IAgentLifecycle): void {
  pi.on("agent_settled", async () => {
    await lifecycle.onAgentSettled();
  });
}
