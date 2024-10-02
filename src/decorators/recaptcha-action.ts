import { SetMetadata } from '@nestjs/common';

export const ReCaptchaAction = (action: string) => SetMetadata('action', action);
