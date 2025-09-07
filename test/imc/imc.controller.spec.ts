import { ImcController } from '@/module/imc/api/imc.controller';
import { CalcularImcRequest } from '@/module/imc/dto/calcular-imc-dto';
import { ImcService } from '@/module/imc/services/imc.service';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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

  it('should return IMC and category for valid input', () => {
    const dto: CalcularImcRequest = { altura: 1.75, peso: 70 };
    jest
      .spyOn(service, 'calcularImc')
      .mockReturnValue({ imc: 22.86, categoria: 'Normal' });

    const result = controller.calcular(dto);
    expect(result).toEqual({ imc: 22.86, categoria: 'Normal' });
    expect(service.calcularImc).toHaveBeenCalledWith(dto);
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
