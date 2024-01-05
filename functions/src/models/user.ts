export interface User {
  userId: string;
  name: string;
  email: string;
  created_at: number;
  subscription: SubscriptionStatus;
  lastDataFetchUnix: number;
  wuStations: [
    {
      id: string;
      name: string;
      order: number;
      createdAt: number;
    }
  ]
}

export enum SubscriptionStatus {
  free = "free",
  tierOne = "tierOne",
  tierTwo = "tierTwo",
  tierThree = "tierThree",
  admin = "admin",
}
