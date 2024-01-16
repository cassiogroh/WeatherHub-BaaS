/**
 * Callable cloud Functions
 */
export const cloudFunctions = {
  /**
   * @param {number} latitude
   * @param {number} longitude
   */
  getForecast: "getForecast",
  /**
   * @param {string} stationId
   * @param {string} userId
   */
  addNewStation: "addNewStation",
  /**
   * @param {string} stationId
   * @param {string} newName
   * @param {string} userId
   */
  renameStation: "renameStation",
  /**
   * @param {string} stationId
   * @param {string} userId
   */
  deleteStation: "deleteStation",
  /**
   * @param {string} userId
   * @param {string} name ?
   * @param {string} email ?
   * @param {string} password ?
   */
  updateProfile: "updateProfile",
  /**
   * @param {string} userId
   */
  deleteAccount: "deleteAccount",
  /**
   * @param {string} userId
   * @param {string[]} stationsIds
   */
  getCurrentConditions: "getCurrentConditions",
  /**
   * @param {string} userId
   * @param {string[]} stationsIds
   */
  getHistoricalConditions: "getHistoricConditions",
};
