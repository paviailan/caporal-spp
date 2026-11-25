import type { LearningEvidence, LearningNeed } from "./learning-types";

const DAY_MS = 86_400_000;

function parseDate(value: string, field: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${field} must use YYYY-MM-DD`);
  }
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new Error(`${field} must be a real calendar date`);
  }
  return timestamp;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

/**
 * Converts a candidate's evidence into an explainable review recommendation.
 * The caller supplies "today" so results remain deterministic and testable.
 */
export function evaluateLearningNeed(
  evidence: LearningEvidence,
  today: string
): LearningNeed {
  const todayTimestamp = parseDate(today, "today");
  if (!evidence.chapterId.trim()) throw new Error("chapterId is required");
  if (!Number.isInteger(evidence.attempts) || evidence.attempts < 0) {
    throw new Error("attempts must be a non-negative integer");
  }
  if (!Number.isInteger(evidence.correctAnswers)
    || evidence.correctAnswers < 0
    || evidence.correctAnswers > evidence.attempts) {
    throw new Error("correctAnswers must be between zero and attempts");
  }
  if (!Number.isInteger(evidence.consecutiveFailures) || evidence.consecutiveFailures < 0) {
    throw new Error("consecutiveFailures must be a non-negative integer");
  }
  if (![1, 2, 3, 4, 5].includes(evidence.importance)) {
    throw new Error("importance must be between 1 and 5");
  }

  const lastPracticedTimestamp = evidence.lastPracticedOn === null
    ? null
    : parseDate(evidence.lastPracticedOn, "lastPracticedOn");
  if (lastPracticedTimestamp !== null && lastPracticedTimestamp > todayTimestamp) {
    throw new Error("lastPracticedOn cannot be in the future");
  }

  // A small evidence sample must not be mistaken for confirmed mastery.
  const accuracy = evidence.attempts === 0
    ? 0
    : evidence.correctAnswers / evidence.attempts;
  const confidence = Math.min(evidence.attempts / 5, 1);
  const masteryPercent = Math.round(accuracy * confidence * 100);

  const intervalDays = evidence.attempts === 0 || masteryPercent < 40
    ? 1
    : masteryPercent < 60
      ? 3
      : masteryPercent < 80
        ? 7
        : 21;

  const nextReviewTimestamp = lastPracticedTimestamp === null
    ? todayTimestamp
    : lastPracticedTimestamp + intervalDays * DAY_MS;
  const nextReviewOn = formatDate(nextReviewTimestamp);
  const isDue = nextReviewTimestamp <= todayTimestamp;
  const overdueDays = Math.max(0, Math.floor((todayTimestamp - nextReviewTimestamp) / DAY_MS));
  const priorityScore = Math.round(
    evidence.importance * 20
    + (100 - masteryPercent) * 0.5
    + evidence.consecutiveFailures * 5
    + Math.min(overdueDays, 30)
  );

  const reasons = [
    `maîtrise estimée à ${masteryPercent}% sur la base de ${evidence.attempts} tentative(s)`,
    evidence.consecutiveFailures >= 3
      ? `${evidence.consecutiveFailures} échecs consécutifs nécessitent un renforcement ciblé`
      : `importance pédagogique : ${evidence.importance}/5`,
    isDue ? "révision arrivée à échéance" : `prochaine révision prévue le ${nextReviewOn}`
  ];

  return {
    chapterId: evidence.chapterId,
    masteryPercent,
    nextReviewOn,
    isDue,
    priorityScore,
    intervalDays,
    explanation: reasons.join(" ; ")
  };
}
