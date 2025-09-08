import { CalcularImcRequest } from '@/module/imc/application/requests/calcular-imc-dto';
import { ImcService } from '@/module/imc/infrastructure/services/imc.service';
import { ImcController } from '@/module/imc/presentation/api/imc.controller';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@supabase/supabase-js';
import { FakeApplicationUser } from '../shared/fakes/user.fake';
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
    const dto: CalcularImcRequest = { altura: 1.75, peso: 70 };

    jest
      .spyOn(service, 'calcularImc')
      .mockResolvedValue({ imc: 22.86, categoria: 'Normal' });

    const user: User = FakeApplicationUser;

    const result = await controller.calcular(dto, user);
    expect(result).toEqual({ imc: 22.86, categoria: 'Normal' });
    expect(service.calcularImc).toHaveBeenCalledWith(dto, user.id);
  });

  it('should throw BadRequestException for invalid input', async () => {
    const invalidDto: CalcularImcRequest = { altura: -1, peso: 70 };

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
