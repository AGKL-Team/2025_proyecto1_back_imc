import { CalcularImcRequest } from '@/module/imc/dto/calcular-imc-dto';
import { SaveRecordError } from '@/module/imc/errors/save-record-error';
import { ImcRecord } from '@/module/imc/models/imc-record';
import { ImcService } from '@/module/imc/services/imc.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('ImcService', () => {
  let service: ImcService;
  let repository: Repository<ImcRecord>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImcService,
        {
          provide: getRepositoryToken(ImcRecord),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ImcService>(ImcService);
    repository = module.get<Repository<ImcRecord>>(
      getRepositoryToken(ImcRecord),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate IMC correctly', () => {
    const dto: CalcularImcRequest = { altura: 1.75, peso: 70 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(22.86, 2); // Redondeado a 2 decimales
    expect(result.categoria).toBe('Normal');
  });

  it('should return Bajo peso for IMC < 18.5', () => {
    const dto: CalcularImcRequest = { altura: 1.75, peso: 50 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(16.33, 2);
    expect(result.categoria).toBe('Bajo peso');
  });

  it('should return Sobrepeso for 25 <= IMC < 30', () => {
    const dto: CalcularImcRequest = { altura: 1.75, peso: 80 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(26.12, 2);
    expect(result.categoria).toBe('Sobrepeso');
  });

  it('should return Obeso for IMC >= 30', () => {
    const dto: CalcularImcRequest = { altura: 1.75, peso: 100 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(32.65, 2);
    expect(result.categoria).toBe('Obeso');
  });

  it('should save IMC record to the database', async () => {
    const height = 1.72;
    const weight = 89.15;

    const imcRecord = new ImcRecord();
    imcRecord.height = height;
    imcRecord.weight = weight;

    jest.spyOn(repository, 'create').mockReturnValue(imcRecord);
    jest.spyOn(repository, 'save').mockResolvedValue(imcRecord);

    const result = await service.saveImcRecord(height, weight);
    expect(result).toBe(imcRecord);
    expect(repository.create).toHaveBeenCalledWith({ height, weight });
    expect(repository.save).toHaveBeenCalledWith(imcRecord);
  });

  it('should handle repository save errors gracefully', async () => {
    const height = 1.75;
    const weight = 70;

    jest.spyOn(repository, 'create').mockReturnValue(new ImcRecord());
    jest.spyOn(repository, 'save').mockRejectedValue(new Error('DB error'));

    await expect(service.saveImcRecord(height, weight)).rejects.toThrow(
      SaveRecordError,
    );
  });
});
