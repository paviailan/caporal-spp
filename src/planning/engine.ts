import type {
  AppliedPlanning,
  PlanningInput,
  PlanningProposal,
  ProposalDecision,
  PlanningTask
} from "./types";

function assertValidInput(input: PlanningInput): void {
  if (!input.proposalId.trim()) throw new Error("proposalId is required");
  if (!Number.isInteger(input.sourcePlanVersion) || input.sourcePlanVersion < 1) {
    throw new Error("sourcePlanVersion must be a positive integer");
  }
  if (!Number.isInteger(input.availableMinutes) || input.availableMinutes < 0) {
    throw new Error("availableMinutes must be a non-negative integer");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.weekStart)) {
    throw new Error("weekStart must use YYYY-MM-DD");
  }
  const ids = new Set<string>();
  for (const task of input.tasks) {
    if (!task.id.trim() || ids.has(task.id)) throw new Error("Task IDs must be unique and non-empty");
    ids.add(task.id);
    if (task.track !== input.track) throw new Error("A planning input cannot mix exam tracks");
    if (!Number.isInteger(task.durationMinutes) || task.durationMinutes <= 0) {
      throw new Error(`Invalid duration for task ${task.id}`);
    }
    if (!Number.isFinite(task.priority) || task.priority < 0 || task.priority > 100) {
      throw new Error(`Priority for task ${task.id} must be between 0 and 100`);
    }
  }
}

function comparePriority(a: PlanningTask, b: PlanningTask): number {
  return Number(b.required) - Number(a.required)
    || b.priority - a.priority
    || a.scheduledDate.localeCompare(b.scheduledDate)
    || a.id.localeCompare(b.id);
}

/**
 * Produces a deterministic weekly proposal. It never mutates the input and
 * never edits completed tasks. Missed tasks are explicitly not carried forward.
 */
export function createWeeklyProposal(input: PlanningInput): PlanningProposal {
  assertValidInput(input);

  const changes: PlanningProposal["changes"] = [];
  const alerts: string[] = [];
  const completed = input.tasks.filter((task) => task.status === "completed");
  const missed = input.tasks.filter((task) => task.status === "missed");
  const candidates = input.tasks
    .filter((task) => task.status === "planned" || task.status === "partial")
    .sort(comparePriority);

  for (const task of completed) {
    changes.push({
      taskId: task.id,
      type: "keep",
      reasonCode: "preserve_completed",
      explanation: "Séance terminée : elle est conservée et ne peut pas être modifiée."
    });
  }

  for (const task of missed) {
    changes.push({
      taskId: task.id,
      type: "remove",
      reasonCode: "missed_not_rescheduled",
      explanation: "Séance manquée : elle n'est pas reportée automatiquement afin de ne pas surcharger la semaine."
    });
  }

  const requiredMinutes = candidates
    .filter((task) => task.required)
    .reduce((sum, task) => sum + task.durationMinutes, 0);

  if (requiredMinutes > input.availableMinutes) {
    alerts.push(
      `Les tâches prioritaires obligatoires représentent ${requiredMinutes} min pour ${input.availableMinutes} min disponibles. Une intervention du candidat est nécessaire.`
    );
  }

  let remaining = input.availableMinutes;
  for (const task of candidates) {
    if (task.required) {
      remaining -= task.durationMinutes;
      changes.push({
        taskId: task.id,
        type: "keep",
        reasonCode: requiredMinutes > input.availableMinutes ? "required_over_capacity" : "priority_within_capacity",
        explanation: requiredMinutes > input.availableMinutes
          ? "Séance obligatoire conservée malgré une capacité hebdomadaire insuffisante ; le dépassement est signalé."
          : "Séance prioritaire obligatoire conservée."
      });
      continue;
    }

    if (task.durationMinutes <= remaining) {
      remaining -= task.durationMinutes;
      changes.push({
        taskId: task.id,
        type: "keep",
        reasonCode: "priority_within_capacity",
        explanation: "Séance conservée : sa priorité permet de la maintenir dans le temps disponible."
      });
    } else {
      changes.push({
        taskId: task.id,
        type: "remove",
        reasonCode: "capacity_arbitration",
        explanation: "Séance retirée de cette semaine : la capacité disponible est réservée aux tâches plus prioritaires. Elle pourra être reprogrammée lors d'une prochaine proposition."
      });
    }
  }

  const keptIds = new Set(changes.filter((change) => change.type === "keep").map((change) => change.taskId));
  const plannedMinutes = input.tasks
    .filter((task) => keptIds.has(task.id) && task.status !== "completed")
    .reduce((sum, task) => sum + task.durationMinutes, 0);

  return {
    id: input.proposalId,
    sourcePlanVersion: input.sourcePlanVersion,
    track: input.track,
    weekStart: input.weekStart,
    changes,
    alerts,
    plannedMinutes,
    availableMinutes: input.availableMinutes
  };
}

/**
 * Applies only the candidate-approved changes to a copy of the active tasks.
 * The caller must separately enforce sourcePlanVersion against the active plan.
 */
export function applyProposalDecision(
  activeTasks: PlanningTask[],
  proposal: PlanningProposal,
  decision: ProposalDecision
): AppliedPlanning {
  if (decision.type === "reject") {
    return { tasks: activeTasks.map((task) => ({ ...task })), appliedChangeIds: [] };
  }

  const changes = decision.type === "accept-all"
    ? proposal.changes
    : proposal.changes.filter((change) => decision.changeIds.includes(change.taskId));

  const byId = new Map(changes.map((change) => [change.taskId, change]));
  const tasks = activeTasks
    .filter((task) => byId.get(task.id)?.type !== "remove")
    .map((task) => ({ ...task }));

  return {
    tasks,
    appliedChangeIds: changes.map((change) => change.taskId)
  };
}
