import { convertParamToBoolean, convertParamToDate, convertParamToNumber } from '../query-params';
import { ClassTransformOptions, TransformationType } from 'class-transformer';

class TransformFnParams {
  key = '';
  obj = {};
  type = TransformationType.CLASS_TO_CLASS;
  options: ClassTransformOptions;
  constructor(public value) {}
}

describe('query-params', () => {
  describe('convertParamToNumber', () => {
    it('should convert parameter to Number', () => {
      const param = new TransformFnParams('6');
      expect(convertParamToNumber(param)).toEqual(6);
    });
  });
  describe('convertParamToBoolean', () => {
    it('should return true', () => {
      const param = new TransformFnParams('true');
      expect(convertParamToBoolean(param)).toEqual(true);
    });
    it('should return false if param is not equal to true', () => {
      const param = new TransformFnParams('s');
      expect(convertParamToBoolean(param)).toEqual(false);
    });
  });
  describe('convertParamToDate', () => {
    it('should convert parameter to Date', () => {
      const param = new TransformFnParams(new Date().getTime());
      expect(convertParamToDate(param) instanceof Date).toEqual(true);
    });
    it('should return undefined if param is empty string', () => {
      const param = new TransformFnParams('');
      expect(convertParamToDate(param)).toEqual(undefined);
    });
  });
});
