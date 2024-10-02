import { getEnumKeyByEnumValue } from '../enum-helper';
import { ERideStatusStrictnessLevel } from '../../enums/ride-status.enum';

describe('Enum helper', () => {
  it('should get enum key by value', () => {
    const result = getEnumKeyByEnumValue(ERideStatusStrictnessLevel, 1);
    expect(result).toEqual('ACCEPTED');
  });
});
