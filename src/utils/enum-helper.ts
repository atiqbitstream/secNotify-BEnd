export function getEnumKeyByEnumValue<TEnumKey, TEnumVal extends string | number>(
  givenEnum: TEnumKey,
  enumValue: TEnumVal
): string {
  const key = Object.keys(givenEnum).find((x) => givenEnum[x] === enumValue);
  return key || '';
}
