import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveRecordError } from '../../src/module/imc/application/errors/save-record-error';
import { CalcularImcRequest } from '../../src/module/imc/application/requests/calcular-imc-request';
import { Category } from '../../src/module/imc/domain/models/category';
import { ImcRecord } from '../../src/module/imc/domain/models/imc-record';
import { ImcService } from '../../src/module/imc/infrastructure/services/imc.service';
import { CategoryBuilder } from '../shared/builders/category-builder';
import { fakeImcRecord } from '../shared/fakes/imc.fake';
import { fakeApplicationUser } from '../shared/fakes/user.fake';
import { categoryFake } from './../shared/fakes/category.fake';

describe('ImcService', () => {
  let service: ImcService;
  let imcRepository: Repository<ImcRecord>;
  let categoryRepository: Repository<Category>;
  let queryBuilder: any;

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
    imcRepository = module.get<Repository<ImcRecord>>(
      getRepositoryToken(ImcRecord),
    );
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([fakeImcRecord]),
    };

    imcRepository.createQueryBuilder = jest.fn();
    (imcRepository.createQueryBuilder as jest.Mock).mockReturnValue(
      queryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(imcRepository).toBeDefined();
    expect(categoryRepository).toBeDefined();
  });

  // ===== Calculate IMC Tests =====

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

  // ===== Save IMC Record Tests =====

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

  // ===== Get History IMC Records Tests =====

  it('should return IMC history for a user', async () => {
    // Arrange
    const user = fakeApplicationUser;
    const imcRecords: ImcRecord[] = [
      fakeImcRecord,
      { ...fakeImcRecord, id: 2 },
    ];

    jest.spyOn(queryBuilder, 'getMany').mockResolvedValue(imcRecords);

    // Act
    const result = await service.getRecords(user.id);

    // Assert
    expect(result).toBe(imcRecords);
    expect(queryBuilder.where).toHaveBeenCalledWith('imc.userId = :userId', {
      userId: user.id,
    });
    expect(queryBuilder.getMany).toHaveBeenCalled();
  });

  it('should return IMC history for a user within a date range', async () => {
    // Arrange
    const user = fakeApplicationUser;
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');
    const imcRecords: ImcRecord[] = [
      { ...fakeImcRecord, date: new Date('2025-06-15') },
      { ...fakeImcRecord, id: 2, date: new Date('2025-11-20') },
    ];

    jest.spyOn(queryBuilder, 'getMany').mockResolvedValue(imcRecords);

    // Act
    const result = await service.getRecords(user.id, startDate, endDate);

    // Assert
    expect(result).toEqual(imcRecords);
    expect(queryBuilder.andWhere).toHaveBeenCalledTimes(2);
    expect(queryBuilder.where).toHaveBeenCalledWith('imc.userId = :userId', {
      userId: user.id,
    });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      1,
      'imc.date >= :startDate',
      { startDate },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      2,
      'imc.date <= :endDate',
      { endDate },
    );
    expect(queryBuilder.getMany).toHaveBeenCalled();
  });

  it('should return an empty array if no IMC records found', async () => {
    // Arrange
    const user = fakeApplicationUser;

    jest.spyOn(queryBuilder, 'getMany').mockResolvedValue([]);

    // Act
    const result = await service.getRecords(user.id);

    // Assert
    expect(result).toEqual([]);
    expect(queryBuilder.where).toHaveBeenCalledWith('imc.userId = :userId', {
      userId: user.id,
    });
    expect(queryBuilder.getMany).toHaveBeenCalled();
  });

  it('should return IMC records ordered by date descending', async () => {
    // Arrange
    const user = fakeApplicationUser;
    const imcRecords: ImcRecord[] = [
      { ...fakeImcRecord, date: new Date('2025-06-15') },
      { ...fakeImcRecord, id: 2, date: new Date('2025-11-20') },
      { ...fakeImcRecord, id: 3, date: new Date('2025-01-10') },
    ];

    jest.spyOn(queryBuilder, 'getMany').mockResolvedValue(imcRecords);

    // Act
    const result = await service.getRecords(user.id);

    // Assert
    expect(result).toBe(imcRecords);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('imc.date', 'DESC');
    expect(queryBuilder.getMany).toHaveBeenCalled();
  });

  it('should return IMC records with start date but no end date', async () => {
    // Arrange
    const user = fakeApplicationUser;
    const startDate = new Date('2025-01-01');
    const imcRecords: ImcRecord[] = [
      { ...fakeImcRecord, date: new Date('2025-06-15') },
      { ...fakeImcRecord, id: 2, date: new Date('2025-11-20') },
    ];

    jest.spyOn(queryBuilder, 'getMany').mockResolvedValue(imcRecords);

    // Act
    const result = await service.getRecords(user.id, startDate);

    // Assert
    expect(result).toBe(imcRecords);
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'imc.date >= :startDate',
      { startDate },
    );
    expect(queryBuilder.getMany).toHaveBeenCalled();
  });

  it('should return IMC records with end date but no start date', async () => {
    // Arrange
    const user = fakeApplicationUser;
    const endDate = new Date('2025-12-31');
    const imcRecords: ImcRecord[] = [
      { ...fakeImcRecord, date: new Date('2025-06-15') },
      { ...fakeImcRecord, id: 2, date: new Date('2025-11-20') },
    ];

    jest.spyOn(queryBuilder, 'getMany').mockResolvedValue(imcRecords);

    // Act
    const result = await service.getRecords(user.id, undefined, endDate);

    // Assert
    expect(result).toBe(imcRecords);
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('imc.date <= :endDate', {
      endDate,
    });
    expect(queryBuilder.getMany).toHaveBeenCalled();
  });

  it('should handle error when endDate is before startDate', async () => {
    // Arrange
    const user = fakeApplicationUser;
    const startDate = new Date('2025-12-31');
    const endDate = new Date('2025-01-01');

    // Act & Assert
    await expect(
      service.getRecords(user.id, startDate, endDate),
    ).rejects.toThrow('The start date must be earlier than the end date.');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
