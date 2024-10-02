import { ValidationPipe } from '@nestjs/common';
import { ValidatorOptions } from '@nestjs/common/interfaces/external/validator-options.interface';

export class UndefinedFieldsValidationPipe extends ValidationPipe {
  protected validatorOptions: ValidatorOptions = {
    skipUndefinedProperties: true,
    whitelist: true
  };
  isTransformEnabled = true;
}
