import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@supabase/supabase-js';
import { CalcularImcRequest } from '../../src/module/imc/application/requests/calcular-imc-request';
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
});
