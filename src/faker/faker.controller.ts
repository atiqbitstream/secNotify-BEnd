import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FakerService } from './faker.service';
import { CreateFakerDto } from './dto/create-faker.dto';
import { UpdateFakerDto } from './dto/update-faker.dto';

@Controller('faker')
export class FakerController {
  constructor(private readonly fakerService: FakerService) {}

  @Post()
  async populateDb()
  {
    return await this.fakerService.setUpForDemo();
  }
}
