// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2026 avtc <tarasenkov@gmail.com>

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  _resetContinueFollowUp,
  consumeContinueFollowUp,
  hasContinueFollowUp,
  stageContinueFollowUp,
} from "../../src/compaction/continue-followup.js";

describe("continue-followup slot", () => {
  beforeEach(() => {
    _resetContinueFollowUp();
  });
  afterEach(() => {
    _resetContinueFollowUp();
  });

  test("stageContinueFollowUp stages a message; hasContinueFollowUp reflects it", () => {
    expect(hasContinueFollowUp()).toBe(false);
    stageContinueFollowUp("continue the work");
    expect(hasContinueFollowUp()).toBe(true);
  });

  test("consumeContinueFollowUp returns the staged message and clears the slot", () => {
    stageContinueFollowUp("continue the work");
    expect(consumeContinueFollowUp()).toBe("continue the work");
    expect(hasContinueFollowUp()).toBe(false);
    // A second consume returns null (already cleared).
    expect(consumeContinueFollowUp()).toBe(null);
  });

  test("consumeContinueFollowUp returns null when nothing is staged", () => {
    expect(consumeContinueFollowUp()).toBe(null);
  });

  test("stageContinueFollowUp overwrites a previous staged message", () => {
    stageContinueFollowUp("first");
    stageContinueFollowUp("second");
    expect(consumeContinueFollowUp()).toBe("second");
  });
});
