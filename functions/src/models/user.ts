export interface User {
  userId: string;
  name: string;
  email: string;
  created_at: string;
  subscription: SubscriptionStatus;
  lastDataFetchUnix: number;
  stationsIds: string[];
}

export enum SubscriptionStatus {
  free = "free",
  tierOne = "tierOne",
  tierTwo = "tierTwo",
  tierThree = "tierThree",
  admin = "admin",
}
