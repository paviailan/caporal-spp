export type ExamTrack = "external-classic" | "external-spv";
export type TaskStatus = "planned" | "completed" | "missed" | "partial";
export type ChangeType = "keep" | "remove";

export interface PlanningTask {
  id: string;
  track: ExamTrack;
  title: string;
  scheduledDate: string;
  durationMinutes: number;
  priority: number;
  required: boolean;
  status: TaskStatus;
}

export interface PlanningInput {
  proposalId: string;
  sourcePlanVersion: number;
  track: ExamTrack;
  weekStart: string;
  availableMinutes: number;
  tasks: PlanningTask[];
}

export interface PlanningChange {
  taskId: string;
  type: ChangeType;
  reasonCode: "preserve_completed" | "missed_not_rescheduled" | "priority_within_capacity" | "capacity_arbitration" | "required_over_capacity";
  explanation: string;
}

export interface PlanningProposal {
  id: string;
  sourcePlanVersion: number;
  track: ExamTrack;
  weekStart: string;
  changes: PlanningChange[];
  alerts: string[];
  plannedMinutes: number;
  availableMinutes: number;
}

export type ProposalDecision =
  | { type: "reject" }
  | { type: "accept-all" }
  | { type: "accept-selected"; changeIds: string[] };

export interface AppliedPlanning {
  tasks: PlanningTask[];
  appliedChangeIds: string[];
}
