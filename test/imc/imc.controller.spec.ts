import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@supabase/supabase-js';
import { CalcularImcRequest } from '../../src/module/imc/application/requests/calcular-imc-request';
import { HistoryRequest } from '../../src/module/imc/application/requests/history-request';
import { ImcService } from '../../src/module/imc/infrastructure/services/imc.service';
import { ImcController } from '../../src/module/imc/presentation/api/imc.controller';
import { fakeApplicationUser } from '../shared/fakes/user.fake';
import { ConfigTestProvider } from '../shared/providers/config-test.provider';
import { SupabaseTestProvider } from '../shared/providers/supabase-config-test.provider';

describe('ImcController', () => {
  let controller: ImcController;
  let service: ImcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImcController],
      providers: [
        {
          provide: ImcService,
          useValue: {
            calcularImc: jest.fn(),
            getRecords: jest.fn(),
          },
        },
        SupabaseTestProvider,
        ConfigTestProvider,
      ],
    }).compile();

    controller = module.get<ImcController>(ImcController);
    service = module.get<ImcService>(ImcService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ========== Calculate IMC Tests ==========

  it('should return IMC and category for valid input', async () => {
    const dto: CalcularImcRequest = { height: 1.75, weight: 70 };

    jest
      .spyOn(service, 'calcularImc')
      .mockResolvedValue({ imc: 22.86, category: 'Normal' });

    const user: User = fakeApplicationUser;

    const result = await controller.calcular(dto, user);
    expect(result).toEqual({ imc: 22.86, category: 'Normal' });
    expect(service.calcularImc).toHaveBeenCalledWith(dto, user.id);
  });

  it('should throw BadRequestException for invalid input', async () => {
    const invalidDto: CalcularImcRequest = { height: -1, weight: 70 };

    // Aplicar ValidationPipe manualmente en la prueba
    const validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    await expect(
      validationPipe.transform(invalidDto, {
        type: 'body',
        metatype: CalcularImcRequest,
      }),
    ).rejects.toThrow(BadRequestException);

    // Verificar que el servicio no se llama porque la validación falla antes
    expect(service.calcularImc).not.toHaveBeenCalled();
  });

  // ========== History Tests ==========

  it('should return IMC history for valid user without date filters', async () => {
    // Arrange
    const user: User = fakeApplicationUser;

    jest.spyOn(service, 'getRecords').mockResolvedValue([]);

    // Act
    const result = await controller.getHistory(user, {});

    // Assert
    expect(result).toEqual([]);
    expect(service.getRecords).toHaveBeenCalledWith(
      user.id,
      undefined,
      undefined,
    );
  });

  it('should return IMC history with date filters', async () => {
    // Arrange
    const user: User = fakeApplicationUser;
    const from = new Date('2025-01-01');
    const to = new Date('2025-01-31');

    jest.spyOn(service, 'getRecords').mockResolvedValue([]);

    // Act
    const result = await controller.getHistory(user, {
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    });

    // Assert
    expect(result).toEqual([]);
    expect(service.getRecords).toHaveBeenCalledWith(user.id, from, to);
  });

  it('should throw BadRequestException for invalid date filters', async () => {
    // Arrange
    const invalidStartDate = 'invalid-date';
    const invalidEndDate = '2025-01-31';

    const validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    // Act
    await expect(
      validationPipe.transform(
        { startDate: invalidStartDate, endDate: invalidEndDate },
        {
          type: 'query',
          metatype: HistoryRequest,
        },
      ),
    ).rejects.toThrow(BadRequestException);

    // Assert
    expect(service.getRecords).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if startDate is after endDate', async () => {
    // Arrange
    const user: User = fakeApplicationUser;
    const startDate = '2025-02-01';
    const endDate = '2025-01-01';

    jest.spyOn(service, 'getRecords').mockResolvedValue([]);

    // Act
    const result = controller.getHistory(user, { startDate, endDate });

    // Assert
    await expect(result).rejects.toThrow(BadRequestException);
    expect(service.getRecords).not.toHaveBeenCalled();
  });
});
