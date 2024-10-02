export function areArraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (!arr1 && !arr2) return true;
  if (arr1?.length != arr2?.length) return false;
  return !arr1.some((element, index) => element !== arr2[index]);
}
