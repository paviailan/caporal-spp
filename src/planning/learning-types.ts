export interface LearningEvidence {
  chapterId: string;
  attempts: number;
  correctAnswers: number;
  consecutiveFailures: number;
  lastPracticedOn: string | null;
  importance: 1 | 2 | 3 | 4 | 5;
}

export interface LearningNeed {
  chapterId: string;
  masteryPercent: number;
  nextReviewOn: string;
  isDue: boolean;
  priorityScore: number;
  intervalDays: number;
  explanation: string;
}
