import { SaveRecordError } from '@/module/imc/application/errors/save-record-error';
import { CalcularImcRequest } from '@/module/imc/application/requests/calcular-imc-request';
import { Category } from '@/module/imc/domain/models/category';
import { ImcRecord } from '@/module/imc/domain/models/imc-record';
import { ImcService } from '@/module/imc/infrastructure/services/imc.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryBuilder } from '../shared/builders/category-builder';
import { fakeImcRecord } from '../shared/fakes/imc.fake';
import { fakeApplicationUser } from '../shared/fakes/user.fake';
import { categoryFake } from './../shared/fakes/category.fake';

describe('ImcService', () => {
  let service: ImcService;
  let imcRepository: Repository<ImcRecord>;
  let categoryRepository: Repository<Category>;

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
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ImcService>(ImcService);
    imcRepository = module.get<Repository<ImcRecord>>(
      getRepositoryToken(ImcRecord),
    );
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(imcRepository).toBeDefined();
    expect(categoryRepository).toBeDefined();
  });

  it('should calculate IMC correctly', async () => {
    // Arrange
    const dto: CalcularImcRequest = { height: 1.75, weight: 70 };
    const user = fakeApplicationUser;
    const imcRecord = fakeImcRecord;

    // Expect 'Normal' category for IMC between 18.51 and 25
    const category = new CategoryBuilder().withName('Normal').build();

    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category);
    jest.spyOn(imcRepository, 'create').mockReturnValue(imcRecord);
    jest.spyOn(imcRepository, 'save').mockResolvedValue(imcRecord);

    // Act
    const result = await service.calcularImc(dto, user.id);

    // Assert
    expect(result.imc).toBeCloseTo(22.86, 2);
    expect(result.category).toBe('Normal');
  });

  it('should return Bajo peso for IMC < 18.5', async () => {
    // Arrange
    const dto: CalcularImcRequest = { height: 1.75, weight: 50 };
    const user = fakeApplicationUser;
    const imcRecord = fakeImcRecord;

    const category = new CategoryBuilder().withName('Bajo peso').build();
    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category);
    jest.spyOn(imcRepository, 'create').mockReturnValue(imcRecord);
    jest.spyOn(imcRepository, 'save').mockResolvedValue(imcRecord);

    // Act
    const result = await service.calcularImc(dto, user.id);

    // Assert
    expect(result.imc).toBeCloseTo(16.33, 2);
    expect(result.category).toBe('Bajo peso');
  });

  it('should return Sobrepeso for 25 <= IMC < 30', async () => {
    // Arrange
    const dto: CalcularImcRequest = { height: 1.75, weight: 80 };
    const user = fakeApplicationUser;
    const imcRecord = fakeImcRecord;

    const category = new CategoryBuilder().withName('Sobrepeso').build();

    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category);
    jest.spyOn(imcRepository, 'create').mockReturnValue(imcRecord);
    jest.spyOn(imcRepository, 'save').mockResolvedValue(imcRecord);

    // Act
    const result = await service.calcularImc(dto, user.id);

    // Assert
    expect(result.imc).toBeCloseTo(26.12, 2);
    expect(result.category).toBe('Sobrepeso');
  });

  it('should return Obeso for IMC >= 30', async () => {
    // Arrange
    const dto: CalcularImcRequest = { height: 1.75, weight: 100 };
    const user = fakeApplicationUser;
    const imcRecord = fakeImcRecord;

    const category = new CategoryBuilder().withName('Obeso').build();

    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category);
    jest.spyOn(imcRepository, 'create').mockReturnValue(imcRecord);
    jest.spyOn(imcRepository, 'save').mockResolvedValue(imcRecord);

    // Act
    const result = await service.calcularImc(dto, user.id);

    // Assert
    expect(result.imc).toBeCloseTo(imcRecord.imc, 2);
    expect(result.category).toBe(imcRecord.category.name);
    expect(result.imc).toBe(imcRecord.imc);
  });

  it('should save IMC record to the database', async () => {
    // Arrange
    const imcRecord = fakeImcRecord;
    const user = fakeApplicationUser;
    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(categoryFake);
    jest.spyOn(imcRepository, 'create').mockReturnValue(imcRecord);
    jest.spyOn(imcRepository, 'save').mockResolvedValue(imcRecord);

    // Act
    const result = await service.saveImcRecord(
      imcRecord.height,
      imcRecord.weight,
      imcRecord.imc,
      imcRecord.category,
      user.id,
    );

    // Assert
    expect(result).toBe(imcRecord);
    expect(imcRepository.save).toHaveBeenCalledWith(imcRecord);
    expect(result.date).toBe(imcRecord.date);
    expect(result.imc).toBeCloseTo(imcRecord.imc, 2);
  });

  it('should handle repository save errors gracefully', async () => {
    const imc = fakeImcRecord;
    const user = fakeApplicationUser;
    const category = categoryFake;

    jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(category);
    jest.spyOn(imcRepository, 'create').mockReturnValue(new ImcRecord());
    jest.spyOn(imcRepository, 'save').mockRejectedValue(new Error('DB error'));

    await expect(
      service.saveImcRecord(imc.height, imc.weight, imc.imc, category, user.id),
    ).rejects.toThrow(SaveRecordError);
  });
});
