export const DAILY_ACTIONS = 1000;
export interface UsageRepository {
  countAction(accountId: string): Promise<void>;
  actionsToday(accountId: string): Promise<number>;
  credits(accountId: string): Promise<{ credits: number } | null | undefined>;
  spent(accountId: string): Promise<{ builder: number; app: number } | null | undefined>;
  storage(accountId: string): Promise<{ bytes: number } | null | undefined>;
  history(accountId: string): Promise<{ day: string; count: number }[]>;
}
export function createUsageService(repository: UsageRepository) {
  return {
    countAction: (accountId: string) => repository.countAction(accountId),
    actionsToday: (accountId: string) => repository.actionsToday(accountId),
    async usageSummary(accountId: string) {
      const [credits, spent, storage, history, today] = await Promise.all([
        repository.credits(accountId), repository.spent(accountId), repository.storage(accountId),
        repository.history(accountId), repository.actionsToday(accountId),
      ]);
      return { actionsToday: today, actionsLimit: DAILY_ACTIONS, actionsHistory: history, credits: credits?.credits ?? 0, creditsSpent: spent ?? { builder: 0, app: 0 }, storageBytes: storage?.bytes ?? 0 };
    },
  };
}
