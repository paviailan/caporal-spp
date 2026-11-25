import { describe, expect, it } from "vitest";
import { applyProposalDecision, createWeeklyProposal } from "./engine";
import type { PlanningInput, PlanningTask } from "./types";

const tasks: PlanningTask[] = [
  { id: "done-1", track: "external-classic", title: "Maths terminées", scheduledDate: "2026-12-01", durationMinutes: 45, priority: 80, required: false, status: "completed" },
  { id: "missed-1", track: "external-classic", title: "Lecture manquée", scheduledDate: "2026-12-02", durationMinutes: 30, priority: 50, required: false, status: "missed" },
  { id: "required-1", track: "external-classic", title: "Examen blanc", scheduledDate: "2026-12-03", durationMinutes: 60, priority: 100, required: true, status: "planned" },
  { id: "high-1", track: "external-classic", title: "Fractions", scheduledDate: "2026-12-04", durationMinutes: 60, priority: 90, required: false, status: "planned" },
  { id: "low-1", track: "external-classic", title: "Révision secondaire", scheduledDate: "2026-12-05", durationMinutes: 45, priority: 20, required: false, status: "planned" }
];

const input: PlanningInput = {
  proposalId: "proposal-week-1", sourcePlanVersion: 3, track: "external-classic",
  weekStart: "2026-11-30", availableMinutes: 120, tasks
};

describe("createWeeklyProposal", () => {
  it("preserves completed tasks and does not reschedule missed tasks", () => {
    const proposal = createWeeklyProposal(input);
    expect(proposal.changes.find((change) => change.taskId === "done-1")?.type).toBe("keep");
    expect(proposal.changes.find((change) => change.taskId === "missed-1")?.type).toBe("remove");
  });
  it("arbitrates capacity by priority instead of shortening every task", () => {
    const proposal = createWeeklyProposal(input);
    expect(proposal.changes.find((change) => change.taskId === "required-1")?.type).toBe("keep");
    expect(proposal.changes.find((change) => change.taskId === "high-1")?.type).toBe("keep");
    expect(proposal.changes.find((change) => change.taskId === "low-1")?.type).toBe("remove");
    expect(proposal.plannedMinutes).toBe(120);
  });
  it("signals when mandatory work exceeds availability", () => {
    const proposal = createWeeklyProposal({ ...input, availableMinutes: 30 });
    expect(proposal.alerts).toHaveLength(1);
    expect(proposal.changes.find((change) => change.taskId === "required-1")?.type).toBe("keep");
  });
  it("is deterministic for identical input", () => {
    expect(createWeeklyProposal(input)).toEqual(createWeeklyProposal(input));
  });
  it("rejects duplicate task identifiers", () => {
    expect(() => createWeeklyProposal({ ...input, tasks: [...tasks, tasks[0]] })).toThrow(/unique/);
  });
  it("rejects mixed exam tracks", () => {
    expect(() => createWeeklyProposal({ ...input, tasks: [{ ...tasks[0], track: "external-spv" }] })).toThrow(/mix exam tracks/);
  });
  it("rejects invalid availability and malformed dates", () => {
    expect(() => createWeeklyProposal({ ...input, availableMinutes: -1 })).toThrow(/availableMinutes/);
    expect(() => createWeeklyProposal({ ...input, weekStart: "next monday" })).toThrow(/YYYY-MM-DD/);
  });
});

describe("applyProposalDecision", () => {
  const proposal = createWeeklyProposal(input);
  it("leaves active tasks unchanged when rejected", () => {
    const result = applyProposalDecision(tasks, 3, proposal, { type: "reject" });
    expect(result.tasks).toEqual(tasks);
    expect(result.appliedChangeIds).toEqual([]);
  });
  it("applies only selected changes on partial approval", () => {
    const result = applyProposalDecision(tasks, 3, proposal, { type: "accept-selected", changeIds: ["low-1"] });
    expect(result.tasks.map((task) => task.id)).not.toContain("low-1");
    expect(result.tasks.map((task) => task.id)).toContain("missed-1");
    expect(result.appliedChangeIds).toEqual(["low-1"]);
  });
  it("removes missed and deprioritized tasks only on full approval", () => {
    const result = applyProposalDecision(tasks, 3, proposal, { type: "accept-all" });
    expect(result.tasks.map((task) => task.id)).not.toContain("missed-1");
    expect(result.tasks.map((task) => task.id)).not.toContain("low-1");
    expect(result.tasks.map((task) => task.id)).toContain("done-1");
  });
  it("blocks a stale proposal", () => {
    expect(() => applyProposalDecision(tasks, 4, proposal, { type: "accept-all" })).toThrow(/Stale proposal/);
  });
  it("never deletes a completed task even if a proposal is malformed", () => {
    const malformed = { ...proposal, changes: proposal.changes.map((change) => change.taskId === "done-1" ? { ...change, type: "remove" as const } : change) };
    const result = applyProposalDecision(tasks, 3, malformed, { type: "accept-all" });
    expect(result.tasks.map((task) => task.id)).toContain("done-1");
  });
  it("rejects unknown selected change identifiers", () => {
    expect(() => applyProposalDecision(tasks, 3, proposal, { type: "accept-selected", changeIds: ["not-a-change"] })).toThrow(/Unknown proposal change IDs/);
  });
});
