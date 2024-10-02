import { TransformFnParams } from 'class-transformer/types/interfaces';
import { roundNumberTwoDecimal } from './strings-helper';

export const convertToIdArray = (arrayParam: TransformFnParams): string[] => {
  if (!arrayParam.value?.length) {
    return [];
  }
  return arrayParam.value.map((stringId) => (stringId.id ? stringId.id : stringId));
};

export const convertParamToNumber = (param: TransformFnParams): number => Number(param.value);

export const convertParamToBoolean = (param: TransformFnParams): boolean => param.value === 'true';

export const convertParamToDate = (param: TransformFnParams): Date => {
  if (param?.value) {
    return new Date(param.value);
  }
};

export const convertMetersToMiles = (distanceInMeters: number) => {
  const meterToMiles = 1609.34;
  return roundNumberTwoDecimal(distanceInMeters / meterToMiles);
};

export const convertParamToDob = (param: TransformFnParams): Date => {
  if (param?.value) {
    const dateStr = (param.value as string).replace(/\//g, '-');
    const date = new Date(dateStr);

    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date;
  }
};

export const convertParamToObject = (param: TransformFnParams) => {
  try {
    return param.value.map((obj) => {
      if (typeof obj === 'string') {
        return JSON.parse(obj);
      } else {
        return obj;
      }
    });
  } catch (err) {
    console.log('TransformFnParams, convertParamToObject => ', err);
  }
};
