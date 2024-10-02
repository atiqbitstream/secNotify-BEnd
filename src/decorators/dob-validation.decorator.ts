import { registerDecorator, ValidationOptions } from 'class-validator';
import { addDays } from 'date-fns';

export function IsNotBiggerThanToday(validationOptions: ValidationOptions = {}) {
  return function (object: unknown, propertyName: string): void {
    const now = new Date();
    
    validationOptions.message = `${propertyName} cannot be bigger than ${now}`;
    registerDecorator({
      name: 'IsNotBiggerThanToday',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any) {
          
          return new Date(value) < new Date();
        }
      }
    });
  };
}
