import { SaveRecordError } from '@/module/imc/application/errors/save-record-error';
import { CalcularImcRequest } from '@/module/imc/application/requests/calcular-imc-dto';
import { Category } from '@/module/imc/domain/models/category';
import { ImcRecord } from '@/module/imc/domain/models/imc-record';
import { ImcService } from '@/module/imc/infrastructure/services/imc.service';
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
        {
          provide: getRepositoryToken(Category),
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
    expect(repository).toBeDefined();
  });

  it('should calculate IMC correctly', async () => {
    // Arrange
    const dto: CalcularImcRequest = { altura: 1.75, peso: 70 };
    const userId: string = 'someValidUUID';
    const imcRecord = new ImcRecord();
    imcRecord.height = dto.altura;
    imcRecord.weight = dto.peso;
    imcRecord.category = new Category();
    imcRecord.category.name = 'Normal';

    jest.spyOn(repository, 'create').mockReturnValue(imcRecord);
    jest.spyOn(repository, 'save').mockResolvedValue(imcRecord);

    // Act
    const result = await service.calcularImc(dto, userId);

    // Assert
    expect(result.imc).toBeCloseTo(22.86, 2);
    expect(result.categoria).toBe('Normal');
  });

  it('should return Bajo peso for IMC < 18.5', async () => {
    // Arrange
    const dto: CalcularImcRequest = { altura: 1.75, peso: 50 };
    const userId: string = 'someValidUUID';
    const imcRecord = new ImcRecord();
    imcRecord.height = dto.altura;
    imcRecord.weight = dto.peso;

    jest.spyOn(repository, 'create').mockReturnValue(imcRecord);
    jest.spyOn(repository, 'save').mockResolvedValue(imcRecord);

    // Act
    const result = await service.calcularImc(dto, userId);

    // Assert
    expect(result.imc).toBeCloseTo(16.33, 2);
    expect(result.categoria).toBe('Bajo peso');
  });

  it('should return Sobrepeso for 25 <= IMC < 30', async () => {
    // Arrange
    const dto: CalcularImcRequest = { altura: 1.75, peso: 80 };
    const userId: string = 'someValidUUID';

    const imcRecord = new ImcRecord();
    imcRecord.height = dto.altura;
    imcRecord.weight = dto.peso;

    jest.spyOn(repository, 'create').mockReturnValue(imcRecord);
    jest.spyOn(repository, 'save').mockResolvedValue(imcRecord);

    // Act
    const result = await service.calcularImc(dto, userId);

    // Assert
    expect(result.imc).toBeCloseTo(26.12, 2);
    expect(result.categoria).toBe('Sobrepeso');
  });

  it('should return Obeso for IMC >= 30', async () => {
    // Arrange
    const dto: CalcularImcRequest = { altura: 1.75, peso: 100 };
    const userId: string = 'someValidUUID';

    const imcRecord = new ImcRecord();
    imcRecord.height = dto.altura;
    imcRecord.weight = dto.peso;
    imcRecord.imc = 32.65;

    jest.spyOn(repository, 'create').mockReturnValue(imcRecord);
    jest.spyOn(repository, 'save').mockResolvedValue(imcRecord);

    // Act
    const result = await service.calcularImc(dto, userId);

    // Assert
    expect(result.imc).toBeCloseTo(32.65, 2);
    expect(result.categoria).toBe('Obeso');
    expect(result.imc).toBe(imcRecord.imc);
  });

  it('should save IMC record to the database', async () => {
    // Arrange
    const height = 1.75;
    const weight = 100;
    const category = new Category();
    category.name = 'Obeso';

    const imcRecord = new ImcRecord();
    imcRecord.height = height;
    imcRecord.weight = weight;
    imcRecord.category = category;
    imcRecord.imc = 32.65;
    imcRecord.date = new Date();

    jest.spyOn(repository, 'create').mockReturnValue(imcRecord);
    jest.spyOn(repository, 'save').mockResolvedValue(imcRecord);

    const userId: string = 'someValidUUID';

    // Act
    const result = await service.saveImcRecord(
      height,
      weight,
      imcRecord.imc,
      imcRecord.category.name,
      userId,
    );

    // Assert
    expect(result).toBe(imcRecord);
    expect(repository.save).toHaveBeenCalledWith(imcRecord);
    expect(result.date).toBe(imcRecord.date);
    expect(result.imc).toBeCloseTo(imcRecord.imc, 2);
  });

  it('should handle repository save errors gracefully', async () => {
    const height = 1.75;
    const weight = 100;
    const userId: string = 'someValidUUID';

    jest.spyOn(repository, 'create').mockReturnValue(new ImcRecord());
    jest.spyOn(repository, 'save').mockRejectedValue(new Error('DB error'));

    await expect(
      service.saveImcRecord(height, weight, 32.65, 'Obeso', userId),
    ).rejects.toThrow(SaveRecordError);
  });
});
