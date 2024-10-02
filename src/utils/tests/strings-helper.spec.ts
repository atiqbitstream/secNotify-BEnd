import { prepareCaseInsensitiveRegex, generateId, convertSnakeCaseToCapitalized } from '../strings-helper';

describe('strings-helper', () => {
  describe('generateId', () => {
    it('should append zeros to the beginning if id length < 6', () => {
      const sequenceValue = 123;
      const expected = '000123';
      expect(generateId(sequenceValue)).toEqual(expected);
    });
    it('should append zeros to the beginning and suffix', () => {
      const sequenceValue = 123;
      const suffix = 'A';
      const expected = '000123A';
      expect(generateId(sequenceValue, suffix)).toEqual(expected);
    });
    it('should not append zeros to the beginning if id length is 6 or bigger', () => {
      const sequenceValue = 123456;
      const suffix = 'A';
      const expected = '123456A';
      expect(generateId(sequenceValue, suffix)).toEqual(expected);
    });
  });
  describe('escapeRegExpSpecialSymbols', () => {
    it('should append escape symbol before regex special characters', () => {
      const email = 'email+1@gmail.com';
      expect(prepareCaseInsensitiveRegex(email)).toEqual(new RegExp('^email\\+1@gmail\\.com$', 'i'));
    });
  });
  describe('convertSnakeCaseToCapitalized', () => {
    it('should convert snake case to capitalized sentence', () => {
      const email = 'BY_DAY_OF_MONTH';
      expect(convertSnakeCaseToCapitalized(email)).toEqual('By day of month');
    });
  });
});
