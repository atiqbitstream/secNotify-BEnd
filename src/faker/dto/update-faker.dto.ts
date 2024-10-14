import { PartialType } from '@nestjs/mapped-types';
import { CreateFakerDto } from './create-faker.dto';

export class UpdateFakerDto extends PartialType(CreateFakerDto) {}
