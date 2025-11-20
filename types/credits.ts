export type TrialStatus = "NOT_STARTED" | "ACTIVE" | "EXHAUSTED";

export type CreditSummary = {
  credits: number;
  trialCredits: number;
  trialStatus: TrialStatus;
  hasCredits: boolean;
  hasTrialCredits: boolean;
};

