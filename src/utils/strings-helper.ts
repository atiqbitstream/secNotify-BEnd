import { RideChangeRequestEntity } from "../api/ride-change-request/entities/ride-change-request.entity";

const MIN_ID_LENGTH = 6;

export const generateId = (sequenceValue: number, suffix = ""): string => {
  const numberLength = sequenceValue.toString().length;
  const idLength = Math.max(numberLength, MIN_ID_LENGTH);
  return `${sequenceValue}`.padStart(idLength, "0").concat(suffix);
};

export const generateNextSequenceId = (sequenceValue: number, prefix: string): string => {
  const numberLength = sequenceValue.toString().length;
  const idLength = Math.max(numberLength, MIN_ID_LENGTH);
  const nextSeq = `${sequenceValue}`.padStart(idLength, "0");
  return `${prefix}${nextSeq}`;
};

export const prepareCaseInsensitiveRegex = (str: string): RegExp => {
  const regexString = `^${str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`;
  return new RegExp(regexString, "i");
};

export const pluralizeOptionally = (count: number, subject: string, suffix = "s"): string => {
  return `${count} ${subject}${count !== 1 ? suffix : ""}`;
};

export const capitalizeFirstLetter = (str: string): string => {
  const lowerCaseString = str.toLowerCase();
  return lowerCaseString[0].toUpperCase() + lowerCaseString.slice(1);
};

export const convertSnakeCaseToCapitalized = (str: string): string => {
  const lowerCaseString = str.toLowerCase().split("_").join(" ");
  return lowerCaseString[0].toUpperCase() + lowerCaseString.slice(1);
};

export const concatDollarSign = (amount: number): string => {
  return amount ? `$${roundNumberTwoDecimal(amount)}` : "";
};

export const roundNumberTwoDecimal = (val: number): number => {
  return val ? Number(Number(val).toFixed(2)) : 0;
};

export const getChangeRequestReason = (changeReq: RideChangeRequestEntity): string => {
  if (changeReq.existingValues?.rideStatus !== changeReq.changeReqValues.rideStatus) {
    return `Change ride status from ${changeReq.existingValues.rideStatus} to ${changeReq.changeReqValues.rideStatus}`;
  }

  if (changeReq.existingValues?.waitTime !== changeReq.changeReqValues.waitTime) {
    return `Change ride wait time from ${changeReq.existingValues?.waitTime} to ${changeReq.changeReqValues.waitTime}`;
  }

  if (changeReq.existingValues.rideMileage !== changeReq.changeReqValues.rideMileage) {
    return `Change ride mileage from ${changeReq.existingValues?.rideMileage} to ${changeReq.changeReqValues.rideMileage}`;
  }

  return "";
};
