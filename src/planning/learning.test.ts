import { describe, expect, it } from "vitest";
import { evaluateLearningNeed } from "./learning";
import type { LearningEvidence } from "./learning-types";

const base: LearningEvidence = {
  chapterId: "MATH-04",
  attempts: 5,
  correctAnswers: 5,
  consecutiveFailures: 0,
  lastPracticedOn: "2026-11-01",
  importance: 3
};

describe("evaluateLearningNeed", () => {
  it("does not declare mastery from a single correct answer", () => {
    const result = evaluateLearningNeed({
      ...base, attempts: 1, correctAnswers: 1, lastPracticedOn: null
    }, "2026-11-25");
    expect(result.masteryPercent).toBe(20);
    expect(result.isDue).toBe(true);
    expect(result.intervalDays).toBe(1);
  });

  it("spaces reviews further apart as mastery increases", () => {
    const weak = evaluateLearningNeed({
      ...base, attempts: 5, correctAnswers: 1, lastPracticedOn: "2026-11-24"
    }, "2026-11-25");
    const strong = evaluateLearningNeed({ ...base, lastPracticedOn: "2026-11-20" }, "2026-11-25");
    expect(weak.intervalDays).toBe(1);
    expect(strong.intervalDays).toBe(21);
    expect(strong.isDue).toBe(false);
  });

  it("raises priority after repeated failures", () => {
    const normal = evaluateLearningNeed(base, "2026-11-25");
    const repeated = evaluateLearningNeed({
      ...base, consecutiveFailures: 3
    }, "2026-11-25");
    expect(repeated.priorityScore).toBeGreaterThan(normal.priorityScore);
    expect(repeated.explanation).toContain("3 échecs consécutifs");
  });

  it("is deterministic for the same evidence and date", () => {
    expect(evaluateLearningNeed(base, "2026-11-25"))
      .toEqual(evaluateLearningNeed(base, "2026-11-25"));
  });

  it("rejects impossible answer counts and invalid dates", () => {
    expect(() => evaluateLearningNeed({
      ...base, correctAnswers: 6
    }, "2026-11-25")).toThrow(/correctAnswers/);
    expect(() => evaluateLearningNeed(base, "2026-02-30")).toThrow(/real calendar date/);
  });

  it("does not accept future practice dates", () => {
    expect(() => evaluateLearningNeed({
      ...base, lastPracticedOn: "2026-11-26"
    }, "2026-11-25")).toThrow(/future/);
  });
});
