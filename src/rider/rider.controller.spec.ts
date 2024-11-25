import { Test, TestingModule } from '@nestjs/testing';
import { RiderController } from './rider.controller';
import { RiderService } from './rider.service';

describe('RiderController', () => {
  let controller: RiderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RiderController],
      providers: [RiderService],
    }).compile();

    controller = module.get<RiderController>(RiderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
