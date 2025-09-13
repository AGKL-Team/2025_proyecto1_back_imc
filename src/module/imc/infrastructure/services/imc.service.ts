import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { SaveRecordError } from '../../application/errors/save-record-error';
import { CalcularImcRequest } from '../../application/requests/calcular-imc-request';
import { CalcularImcResponse } from '../../application/responses/calcular-imc-response.interface';
import { Category } from '../../domain/models/category';
import { ImcRecord } from '../../domain/models/imc-record';

@Injectable()
export class ImcService {
  constructor(
    @InjectRepository(ImcRecord)
    private readonly imcRepository: Repository<ImcRecord>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly logger: Logger,
  ) {}

  async calcularImc(
    data: CalcularImcRequest,
    userId: string,
  ): Promise<CalcularImcResponse> {
    const { height, weight } = data;
    const imc = weight / (height * height);
    const imcRedondeado = Math.round(imc * 100) / 100;

    const category = await this.categoryRepository.findOne({
      where: { min: LessThanOrEqual(imc), max: MoreThanOrEqual(imc) },
    });

    this.logger.log(`Calculated IMC: ${imcRedondeado} for user ${userId}`);

    if (!category)
      throw new NotFoundException('No category found for this IMC');

    await this.saveImcRecord(height, weight, imcRedondeado, category, userId);

    this.logger.log(
      `Saved IMC record: ${imcRedondeado} in category ${category.name} for user ${userId}`,
    );

    return { imc: imcRedondeado, category: category.name };
  }

  async saveImcRecord(
    height: number,
    weight: number,
    imc: number,
    category: Category,
    userId: string,
  ) {
    try {
      const imcRecord = this.imcRepository.create({
        height,
        weight,
        userId,
        category: { id: category.id },
        imc: imc,
        date: new Date(),
      });

      return await this.imcRepository.save(imcRecord);
    } catch (error) {
      this.logger.error(
        `Error saving IMC record for user ${userId}: ${(error as Error).message}`,
      );
      throw new SaveRecordError((error as Error).message);
    }
  }

  /**
   * Get all IMC records from the database for a specific user and optional date range.
   * @param userId string
   * @param startDate Date | undefined
   * @param endDate Date | undefined
   * @returns Promise<ImcRecord[]>
   * @fixme filter by user id
   */
  async getRecords(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ImcRecord[]> {
    // Validate the cronology of the dates
    if (startDate && endDate && startDate > endDate) {
      throw new Error('The start date must be earlier than the end date.');
    }

    // Create the base query
    const query = this.imcRepository
      .createQueryBuilder('imc')
      .where('imc.userId = :userId', { userId })
      .leftJoinAndSelect('imc.category', 'category')
      .orderBy('imc.date', 'DESC');

    // Add date filters if provided
    if (startDate) {
      this.logger.log(`Filtering records from ${startDate.toISOString()}`);
      query.andWhere('imc.date >= :startDate', { startDate });
    }

    // Add date filters if provided
    if (endDate) {
      this.logger.log(`Filtering records until ${endDate.toISOString()}`);
      query.andWhere('imc.date <= :endDate', { endDate });
    }

    return await query.getMany();
  }
}
