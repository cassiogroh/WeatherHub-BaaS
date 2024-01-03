import { differenceInMinutes } from "date-fns";
import { User } from "../../models/user";
import { subscriptionStatus } from "../subscriptionInfo";

interface VerifyUserSubscriptionProps {
  user: User;
  currentUnixTime: number;
}

// This function verifies if a user can fetch new data based on their subscription status and the time of their last data fetch
export const verifyUserSubscription = async ({ user, currentUnixTime }: VerifyUserSubscriptionProps) => {
  const { lastDataFetchUnix, subscription, stations } = user;

  // Get the fetch timeout in minutes for the user's subscription type
  const { fetchTimeoutInMin } = subscriptionStatus[subscription];

  // Convert the current Unix time to a Date object
  const currentTime = new Date(currentUnixTime * 1000);
  // Convert the last user data fetch Unix time to a Date object
  const lastDataFetchDate = new Date(lastDataFetchUnix * 1000);

  // Calculate the difference in minutes between the current time and the last data fetch time
  const diffInMinutes = differenceInMinutes(currentTime, lastDataFetchDate);

  // Return a boolean indicating whether the user can fetch new data
  // If the difference in minutes is greater than the fetch timeout, the user can fetch new data
  const userCanFetchNewData = diffInMinutes > fetchTimeoutInMin;

  // Return a boolean indicating whether the user can add a new station or not, based on their subscription status
  const userCanAddNewStation = stations.length < subscriptionStatus[subscription].maxStations;

  return {
    userCanFetchNewData,
    userCanAddNewStation,
  };
};
