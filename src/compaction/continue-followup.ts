// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2026 avtc <tarasenkov@gmail.com>

/**
 * Continue-followup slot — stores the compaction follow-up message for `/fy:continue`.
 *
 * When a context compaction completes but the workflow should not auto-resume (the user
 * manually ran `/compact`, or the agent's turn ended with no staged phase-transition), the
 * compact-handler stages the assembled skill+framing message here and notifies the user to
 * run `/fy:continue`. The command consumes the slot and sends the message via
 * `sendUserMessage`, optionally appending the user's note.
 *
 * Single-slot model: at most one continue follow-up is staged at a time. The slot is
 * cleared on consume and on session teardown (`_resetContinueFollowUp`).
 */

let pendingContinueFollowUp: string | null = null;

/** Stage a compaction follow-up message for `/fy:continue` to retrieve. */
export function stageContinueFollowUp(message: string): void {
  pendingContinueFollowUp = message;
}

/** Whether a continue follow-up is currently staged. */
export function hasContinueFollowUp(): boolean {
  return pendingContinueFollowUp !== null;
}

/**
 * Consume and return the staged continue follow-up (clearing the slot).
 * @returns the staged message, or `null` if nothing is staged.
 */
export function consumeContinueFollowUp(): string | null {
  const message = pendingContinueFollowUp;
  pendingContinueFollowUp = null;
  return message;
}

/** Clear the slot — session teardown / tests. */
export function _resetContinueFollowUp(): void {
  pendingContinueFollowUp = null;
}
