import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './ping.controller';
import { AppService } from './ping.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('ping', () => {
    it('should return "pong"', () => {
      expect(appController.getPing()).toBe('pong');
    });
  });
});
