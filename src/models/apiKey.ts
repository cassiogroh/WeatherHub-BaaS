export interface APIKey {
  id: string;
  key: string;
  currentUsage: number;
  lastUsedAt: number;
  account: {
    login: string;
    password: string;
  }
}
