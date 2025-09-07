import { ConfigService } from '@nestjs/config';

export const ConfigTestProvider = {
  provide: ConfigService,
  useValue: { get: jest.fn() },
};
