export const positiveNumValue = (val: any): boolean => {
  return typeof val === 'number' && val >= 0;
};

export const convertDistanceToMiles = (distanceInMeters: number) => {
  const meterToMiles = 1609.34;
  return Number((distanceInMeters / meterToMiles).toFixed(2)); // Convert meters to miles with 2 decimal places
};