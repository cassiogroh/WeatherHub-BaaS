export const subscriptionStatus = {
  free: {
    maxStations: 3,
    fetchTimeoutInMin: 120,
  },
  tierOne: {
    maxStations: 10,
    fetchTimeoutInMin: 60,
  },
  tierTwo: {
    maxStations: 25,
    fetchTimeoutInMin: 30,
  },
  tierThree: {
    maxStations: 100,
    fetchTimeoutInMin: 15,
  },
  admin: {
    maxStations: 100,
    fetchTimeoutInMin: 0,
  },
};
